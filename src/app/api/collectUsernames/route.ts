// src/app/api/collectUsernames/route.ts

import { NextRequest, NextResponse } from 'next/server';
import snoowrap from 'snoowrap';
import { adminAuth, firestore, admin } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  let progressRef: FirebaseFirestore.DocumentReference | undefined;

  try {
    const { subredditName, campaignId } = await req.json();

    console.log(`Starting to collect usernames from subreddit: ${subredditName}`);

    // Authenticate the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    // Verify the token and get the user ID
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Initialize snoowrap
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!,
    });

    // Initialize Firestore
    const db = admin.firestore();

    // Initialize or reset progress in Firestore
    progressRef = db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId)
      .collection('progress')
      .doc(subredditName);

    await progressRef.set(
      {
        status: 'in-progress',
        collectedUsernames: 0,
        totalPosts: 0,
        processedPosts: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Fetch all posts using the recursive function
    console.log(`Fetching all posts from subreddit: ${subredditName}`);
    const subreddit = reddit.getSubreddit(subredditName);

    const afterTimestamp = 0; // Start from the beginning
    const beforeTimestamp = Math.floor(Date.now() / 1000); // Current time in Unix timestamp

    let allPosts: snoowrap.Submission[] = [];

    console.log('Starting to fetch all posts...');
    allPosts = await fetchAllPosts(subreddit, afterTimestamp, beforeTimestamp);

    console.log(`Total posts fetched: ${allPosts.length}`);

    // Create a set to store unique usernames
    const usernamesSet = new Set<string>();

    // Update totalPosts in progress
    await progressRef.update({
      totalPosts: allPosts.length,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Function to recursively traverse comment tree
    const traverseComments = (comments: snoowrap.Comment[]) => {
      comments.forEach((comment) => {
        if (comment.author && comment.author.name) {
          usernamesSet.add(comment.author.name);
        }
        if (comment.replies && comment.replies.length > 0) {
          traverseComments(comment.replies as snoowrap.Comment[]);
        }
      });
    };

    let processedPosts = 0;

    // Process each post
    for (const post of allPosts) {
      console.log(
        `Processing post ${processedPosts + 1}/${allPosts.length}: ${post.title} (${post.id})`
      );

      if (post.author && post.author.name) {
        usernamesSet.add(post.author.name);
      }

      // Fetch all comments for the post
      try {
        const allComments = await post.comments.fetchMore({ amount: Infinity });

        if (allComments && allComments.length > 0) {
          traverseComments(allComments as snoowrap.Comment[]);
        } else {
          console.log(`No comments found for post ${post.id}`);
        }
      } catch (commentError) {
        console.error(`Error fetching comments for post ${post.id}:`, commentError);
      }

      processedPosts++;

      // Update progress every 10 posts or on the last post
      if (processedPosts % 10 === 0 || processedPosts === allPosts.length) {
        await progressRef.update({
          processedPosts,
          collectedUsernames: usernamesSet.size,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    const usernames = Array.from(usernamesSet);

    console.log(`Total usernames collected: ${usernames.length}`);

    // Save usernames to Firestore under the campaign document
    const usernamesRef = db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId)
      .collection('usernames')
      .doc(subredditName)
      .collection('users');

    // Batch write the usernames
    const batch = db.batch();

    for (const username of usernames) {
      const userDocRef = usernamesRef.doc(username);
      batch.set(userDocRef, {
        attempted: false,
        messaged: false,
        lastAttemptedAt: null,
        lastMessagedAt: null,
        receivedReply: false,
      });
    }

    await batch.commit();

    // Update the subreddit in the campaign to include the total usernames collected
    const campaignRef = db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId);

    // Fetch the existing campaign data
    const campaignDoc = await campaignRef.get();
    const campaignData = campaignDoc.data();

    if (campaignData) {
      const subreddits = campaignData.subreddits || [];

      // Update the specific subreddit
      const updatedSubreddits = subreddits.map((subreddit: any) => {
        if (subreddit.name === subredditName) {
          return {
            ...subreddit,
            usernamesCollected: true,
            totalUsernames: usernames.length, // Store total usernames collected
          };
        }
        return subreddit;
      });

      // Update the campaign document with the new subreddits data
      await campaignRef.update({
        subreddits: updatedSubreddits,
      });
    }

    // Mark progress as completed
    await progressRef.update({
      status: 'completed',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Finished collecting usernames from subreddit: ${subredditName}`);

    return NextResponse.json({ message: 'Usernames collected successfully' });
  } catch (err) {
    console.error('Error collecting usernames:', err);

    // Update progress document to reflect the error
    if (progressRef) {
      await progressRef.set(
        {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Return an error response
    return NextResponse.json(
      { error: 'Error collecting usernames' },
      { status: 500 }
    );
  }
}

async function fetchAllPosts(
  subreddit: snoowrap.Subreddit,
  after: number,
  before: number,
  collectedPosts: snoowrap.Submission[] = [],
): Promise<snoowrap.Submission[]> {
  const MAX_LIMIT = 1000;
  const MIN_TIME_INTERVAL = 1; // Minimum time interval in seconds to prevent infinite recursion

  if (before - after < MIN_TIME_INTERVAL) {
    return collectedPosts;
  }

  const searchOptions = {
    query: `timestamp:${after}..${before}`,
    syntax: 'cloudsearch',
    limit: MAX_LIMIT,
    sort: 'new',
  };

  const posts = await subreddit.search(searchOptions as snoowrap.BaseSearchOptions);
  console.log(`Fetched ${posts.length} posts between ${after} and ${before}`);

  if (posts.length >= MAX_LIMIT) {
    // There might be more posts in this time range, split it further
    const mid = Math.floor((after + before) / 2);
    await fetchAllPosts(subreddit, after, mid, collectedPosts);
    await fetchAllPosts(subreddit, mid + 1, before, collectedPosts);
  } else {
    collectedPosts.push(...posts);

    // Optional: Introduce a delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }

  return collectedPosts;
}
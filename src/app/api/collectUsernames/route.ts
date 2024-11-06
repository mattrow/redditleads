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

    // Fetch top 1000 posts (specifying time to 'all')
    console.log(`Fetching top posts from subreddit: ${subredditName}`);
    const subreddit = reddit.getSubreddit(subredditName);

    const topPosts = await subreddit.getTop({ limit: 1000, time: 'all' });

    console.log(`Number of posts fetched: ${topPosts.length}`);

    const usernamesSet = new Set<string>();

    // Update totalPosts in progress
    await progressRef.update({
      totalPosts: topPosts.length,
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

    for (const post of topPosts) {
      console.log(
        `Processing post ${processedPosts + 1}/${topPosts.length}: ${post.title} (${post.id})`
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
      if (processedPosts % 10 === 0 || processedPosts === topPosts.length) {
        await progressRef.update({
          processedPosts,
          collectedUsernames: usernamesSet.size,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    const usernames = Array.from(usernamesSet);

    console.log(`Total usernames collected: ${usernames.length}`);

    // Save usernames to Firestore under the campaign document (overwrite existing)
    const usernamesRef = db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId)
      .collection('usernames')
      .doc(subredditName);

    await usernamesRef.set({ usernames });

    // Update the subreddit in the campaign to indicate usernames have been collected
    const subredditRef = db
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId);

    await subredditRef.update({
      subreddits: admin.firestore.FieldValue.arrayUnion({
        name: subredditName,
        usernamesCollected: true,
      }),
    });

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
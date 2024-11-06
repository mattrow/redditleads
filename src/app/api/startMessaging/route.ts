import { NextRequest, NextResponse } from 'next/server';
import snoowrap from 'snoowrap';
import { adminAuth, admin } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    // Log the incoming request
    console.log('Received request to /api/startMessaging');

    const body = await req.json();
    console.log('Request body:', body);

    const { campaignId, batchSize = 10 } = body;

    // Authenticate the user making the request
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    console.log('Extracted token:', token);

    // Verify the token and get the user ID
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Decoded token:', decodedToken);
    } catch (authError) {
      console.error('Error verifying token:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = decodedToken.uid;
    console.log('Authenticated user ID:', userId);

    // Get the campaign data
    const campaignRef = admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('campaigns')
      .doc(campaignId);

    const campaignDoc = await campaignRef.get();
    console.log('Campaign document exists:', campaignDoc.exists);

    const campaignData = campaignDoc.data();
    console.log('Campaign data:', campaignData);

    if (!campaignData) {
      console.error('Campaign not found');
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if campaign is running
    if (campaignData.status !== 'running') {
      console.error('Campaign is not running');
      return NextResponse.json({ error: 'Campaign is not running' }, { status: 400 });
    }

    // Initialize snoowrap
    console.log('Initializing snoowrap with credentials');
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!,
    });

    let messagesSent = 0;

    // Fetch usernames to message
    const usernamesRef = campaignRef.collection('usernames');
    const subredditsSnap = await usernamesRef.get();
    console.log('Subreddits fetched:', subredditsSnap.docs.map(doc => doc.id));

    // Log the raw subreddits data
    console.log('Campaign Data Subreddits:', campaignData.subreddits);

    // Get subreddits that have usernames collected
    const subreddits = campaignData.subreddits.filter(
      (sub: { usernamesCollected: string | boolean; }) => sub.usernamesCollected === true || sub.usernamesCollected === 'true'
    );
    console.log('Subreddits fetched:', subreddits);

    if (subreddits.length === 0) {
      console.error('No subreddits with collected usernames');
      return NextResponse.json(
        { error: 'No subreddits with collected usernames' },
        { status: 400 }
      );
    }

    for (const subreddit of subreddits) {
      const subredditName = subreddit.name;
      console.log('Processing subreddit:', subredditName);

      const usersRef = campaignRef
        .collection('usernames')
        .doc(subredditName)
        .collection('users');
      console.log(`usersRef path: ${usersRef.path}`);

      // Query users who have not been attempted yet
      const usersSnap = await usersRef
        .where('attempted', '==', false)
        .limit(batchSize - messagesSent)
        .get();

      console.log(
        `Number of users fetched for ${subredditName}:`,
        usersSnap.size
      );

      if (usersSnap.empty) {
        console.log(`No users to message in ${subredditName}`);
        continue;
      }

      console.log(
        `Users to message in ${subredditName}:`,
        usersSnap.docs.map(doc => doc.id)
      );

      // Process each user
      for (const userDoc of usersSnap.docs) {
        const username = userDoc.id;
        console.log(`Preparing to message user: ${username}`);

        // Replace placeholders in the message template and subject
        const renderedMessage = campaignData.messageTemplate
          .replace('{{username}}', username)
          .replace('{{subreddit}}', subredditName);

        const renderedSubject = campaignData.messageSubject
          .replace('{{username}}', username)
          .replace('{{subreddit}}', subredditName);

        try {
          // Send the message with the subject
          await reddit.composeMessage({
            to: username,
            subject: renderedSubject,
            text: renderedMessage,
          });

          console.log(`Message sent to user: ${username}`);

          // Update user document
          await userDoc.ref.update({
            attempted: true,
            messaged: true,
            lastAttemptedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessagedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          messagesSent++;

        } catch (error) {
          console.error(`Error messaging user ${username}:`, error);

          // Update attempted status
          await userDoc.ref.update({
            attempted: true,
            lastAttemptedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Introduce a delay to comply with rate limit
        if (messagesSent < batchSize) {
          console.log(`Waiting for 1.2 seconds before next message...`);
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // Check if batch size is reached
        if (messagesSent >= batchSize) {
          console.log(`Batch size of ${batchSize} reached.`);
          break;
        }
      }

      if (messagesSent >= batchSize) {
        console.log(`Batch size of ${batchSize} reached.`);
        break;
      }
    }

    // After messaging loop
    console.log(`Total messages sent: ${messagesSent}`);

    // Update campaign stats if needed
    console.log(`Messages sent: ${messagesSent}, updating campaign stats`);
    await campaignRef.update({
      'stats.messagesSent': admin.firestore.FieldValue.increment(messagesSent),
      lastActive: new Date().toISOString(),
    });

    console.log('Messaging completed successfully');
    return NextResponse.json({ message: `Sent ${messagesSent} messages` });
  } catch (error) {
    console.error('Error starting messaging:', error);
    return NextResponse.json({ error: 'Error starting messaging' }, { status: 500 });
  }
} 
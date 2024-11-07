import { NextRequest, NextResponse } from 'next/server';
import snoowrap from 'snoowrap';
import { admin } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to /api/startMessaging');

    // Initialize snoowrap
    console.log('Initializing snoowrap with credentials');
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: process.env.REDDIT_USERNAME!,
      password: process.env.REDDIT_PASSWORD!,
    });

    const batchSize = 10; // Adjust batch size as needed

    // Fetch all users
    const usersSnap = await admin.firestore().collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      console.log(`Processing user: ${userId}`);

      const campaignsRef = admin
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('campaigns');

      // Get campaigns where status is 'running'
      const campaignsSnap = await campaignsRef.where('status', '==', 'running').get();

      for (const campaignDoc of campaignsSnap.docs) {
        const campaignId = campaignDoc.id;
        const campaignData = campaignDoc.data();
        console.log(`Processing campaign: ${campaignId} for user: ${userId}`);

        let messagesSent = 0;

        // Fetch usernames to message
        const campaignRef = campaignsRef.doc(campaignId);
        const usernamesRef = campaignRef.collection('usernames');

        // Get subreddits that have usernames collected
        const subreddits = campaignData.subreddits.filter(
          (sub: { usernamesCollected: boolean | string }) =>
            sub.usernamesCollected === true || sub.usernamesCollected === 'true'
        );
        console.log('Subreddits with collected usernames:', subreddits);

        if (subreddits.length === 0) {
          console.error(
            `No subreddits with collected usernames for campaign: ${campaignId}`
          );
          continue;
        }

        for (const subreddit of subreddits) {
          const subredditName = subreddit.name;
          console.log('Processing subreddit:', subredditName);

          const usersRef = usernamesRef
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
            // Retrieve the username from the document data
            const username = userDoc.data().username;
            console.log(`Preparing to message user: ${username}`);

            if (!username) {
              console.error(`Username is missing for document ID: ${userDoc.id}`);
              // Optionally, you can mark this document as attempted to prevent retrying
              await userDoc.ref.update({
                attempted: true,
                lastAttemptedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              continue;
            }

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
              console.log(
                `Batch size of ${batchSize} reached for campaign: ${campaignId}`
              );
              break;
            }
          }

          if (messagesSent >= batchSize) {
            console.log(
              `Batch size of ${batchSize} reached for campaign: ${campaignId}`
            );
            break;
          }
        }

        // After messaging loop
        console.log(
          `Total messages sent for campaign ${campaignId}: ${messagesSent}`
        );

        if (messagesSent > 0) {
          // Update campaign stats if needed
          console.log(`Messages sent: ${messagesSent}, updating campaign stats`);
          await campaignRef.update({
            'stats.messagesSent': admin.firestore.FieldValue.increment(messagesSent),
            lastActive: new Date().toISOString(),
          });
        } else {
          console.log(`No messages sent for campaign ${campaignId}`);
        }
      }
    }

    console.log('Messaging completed successfully');
    return NextResponse.json({ message: 'Sent messages successfully' });
  } catch (error) {
    console.error('Error starting messaging:', error);
    return NextResponse.json(
      { error: 'Error starting messaging' },
      { status: 500 }
    );
  }
} 
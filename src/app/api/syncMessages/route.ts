// src/app/api/syncMessages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import snoowrap from 'snoowrap';
import { adminAuth, admin } from '@/firebase/admin';

// Define the RedditPrivateMessage interface
interface RedditPrivateMessage {
  name: string;
  id: string;
  body: string;
  author: {
    name: string;
  };
  dest: string;
  parent_id?: string;
  created_utc: number;
  new: boolean;
  markAsRead(): Promise<void>;
}

// Type guard function
function isPrivateMessage(message: any): message is RedditPrivateMessage {
  return message.name.startsWith('t4_') && typeof message.dest === 'string';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
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

    // Get your Reddit username directly
    const myUsername = reddit.username;

    // Fetch all messages (both sent and received)
    const inbox = await reddit.getInbox();
    const messages = await inbox.fetchAll({ amount: 1000 });

    // Initialize Firestore
    const db = admin.firestore();

    for (const message of messages) {
      if (isPrivateMessage(message)) {
        // Now 'message' is of type 'RedditPrivateMessage'
        const isSentByYou = message.author.name === myUsername;

        // Determine the other user's username
        const otherUser = isSentByYou ? message.dest : message.author.name;

        // Prepare message data
        const messageData = {
          id: message.id,
          body: message.body,
          createdAt: admin.firestore.Timestamp.fromDate(
            new Date(message.created_utc * 1000)
          ),
          author: message.author.name,
          recipient: message.dest,
          parentId: message.parent_id || null,
        };

        // Store the message in Firestore under the conversation
        const conversationsRef = db
          .collection('users')
          .doc(userId)
          .collection('conversations')
          .doc(otherUser);

        const messagesRef = conversationsRef.collection('messages');

        await messagesRef.doc(message.id).set(messageData, { merge: true });

        // Mark incoming messages as read
        if (!isSentByYou && message.new) {
          await (message.markAsRead() as any);
        }
      }
      // Optionally, handle other message types (e.g., comment replies)
    }

    return NextResponse.json({ message: 'Messages synced successfully' });
  } catch (error) {
    console.error('Error syncing messages:', error);
    return NextResponse.json({ error: 'Error syncing messages' }, { status: 500 });
  }
}
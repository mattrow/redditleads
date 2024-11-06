// src/app/api/replyMessage/route.ts

import { NextRequest, NextResponse } from 'next/server';
import snoowrap, { PrivateMessage } from 'snoowrap';
import { adminAuth, admin } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { messageId, replyText } = await req.json();

    // Authenticate the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    // Fetch the message being replied to
    const originalMessage = await (reddit.getMessage(messageId) as any).fetch();

    // Send the reply
    const reply = await (originalMessage.reply(replyText) as any);

    // Initialize Firestore
    const db = admin.firestore();

    // Prepare message data
    const messageData = {
      id: reply.id,
      body: replyText,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(reply.created_utc * 1000)),
      author: reply.author.name, // Your Reddit username
      recipient: reply.dest,     // Recipient's username
      parentId: messageId,
    };

    // Store the reply in Firestore
    const conversationsRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations')
      .doc(reply.dest); // The recipient's username

    const messagesRef = conversationsRef.collection('messages');

    await messagesRef.doc(reply.id).set(messageData);

    return NextResponse.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error replying to message:', error);
    return NextResponse.json(
      { error: 'Error replying to message' },
      { status: 500 }
    );
  }
}
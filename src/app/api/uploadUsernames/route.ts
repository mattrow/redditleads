import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, admin } from '@/firebase/admin';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';

// Add function to validate document IDs
function isValidDocId(id: string): boolean {
  const invalidChars = ['/', '\\', '?', '#', '[', ']', '.'];
  if (!id) return false;
  if (id.length > 1500) return false;
  if (['__name__'].includes(id)) return false;
  return !invalidChars.some((char) => id.includes(char));
}

// List of reserved document IDs in Firestore
const RESERVED_IDS = ['__name__'];

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Retrieve campaignId and subredditName from query parameters
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const subredditName = searchParams.get('subredditName');

    if (!campaignId || !subredditName) {
      return NextResponse.json({ error: 'Missing campaignId or subredditName' }, { status: 400 });
    }

    // Read the CSV file from the request body
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();

    // Parse the CSV
    const records: string[][] = parse(text, { columns: false, trim: true }) as string[][];

    // Flatten the array and type usernames as string[]
    const usernames: string[] = records.flat();

    // Remove duplicates and empty strings
    const uniqueUsernames: string[] = Array.from(new Set(usernames)).filter((u): u is string => !!u);

    // **Encode usernames to ensure valid document IDs**
    const usernameEntries = uniqueUsernames.map((username: string) => {
      // Use a hash of the username as the document ID
      const hash = crypto.createHash('sha256').update(username).digest('hex');
      return { username, docId: hash };
    });

    // Save usernames to Firestore under the campaign document
    const db = admin.firestore();

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

    for (const entry of usernameEntries) {
      const userDocRef = usernamesRef.doc(entry.docId);
      batch.set(userDocRef, {
        username: entry.username,
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
            totalUsernames: uniqueUsernames.length, // Store total usernames collected
          };
        }
        return subreddit;
      });

      // Update the campaign document with the new subreddits data
      await campaignRef.update({
        subreddits: updatedSubreddits,
      });
    }

    return NextResponse.json({ message: 'Usernames uploaded successfully' });
  } catch (err) {
    console.error('Error uploading usernames:', err);
    return NextResponse.json({ error: 'Error uploading usernames' }, { status: 500 });
  }
} 
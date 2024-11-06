// src/types.ts

export interface Subreddit {
    name: string;
    members: number;
    replyRate: number;
    messagesSent: number;
    replies: number;
    usernamesCollected?: boolean; // Indicates if usernames have been collected
    totalUsernames?: number; // Total usernames collected
  }
  
  export interface CampaignStats {
    messagesSent: number;
    replies: number;
    replyRate: number;
    totalReach: number;
    remainingMessages: number;
    positiveResponses: number;
    negativeResponses: number;
    neutralResponses: number;
  }
  
  export interface CampaignData {
    id?: string;
    name: string;
    status: 'running' | 'paused';
    stats: CampaignStats;
    subreddits: Subreddit[];
    totalReach: number;
    lastActive: string;
    dailyLimit: number;
    messageTemplate: string;
    messageSubject: string;
  }
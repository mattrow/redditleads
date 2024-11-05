'use client';

import { useRouter } from 'next/navigation';
import { Plus, BarChart3, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/dashboard/Sidebar';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { CampaignData, Subreddit } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchCampaigns = async () => {
      try {
        const campaignsRef = collection(db, `users/${user.uid}/campaigns`);
        const querySnapshot = await getDocs(campaignsRef);
        const campaignsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            stats: {
              messagesSent: 0,
              replies: 0,
              replyRate: 0,
              ...data.stats,
            },
          } as CampaignData;
        });
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-[#1A1A1B]">
      <Sidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-[#242526] border-b border-[#343536] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Campaigns</h1>
              <p className="text-gray-400 mt-1">Manage and monitor your active campaigns</p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/campaign/new')}
              className="bg-[#FF4500] hover:bg-[#FF5722] text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Campaign List */}
        <div className="p-8">
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => router.push(`/dashboard/campaign/${campaign.id}`)}
                className="bg-[#242526] border border-[#343536] rounded-xl p-6 text-left hover:border-[#FF4500]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-white">{campaign.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        campaign.status === 'running'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {campaign.status === 'running' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    Last active: {new Date(campaign.lastActive).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-[#FF4500]" />
                    <div>
                      <div className="text-white font-medium">
                        {campaign.stats.messagesSent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Messages Sent</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-white font-medium">
                        {campaign.stats.replies.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Replies</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-white font-medium">
                        {campaign.stats.replyRate}%
                      </div>
                      <div className="text-sm text-gray-400">Reply Rate</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {campaign.subreddits.map((subreddit: Subreddit) => (
                    <span
                      key={subreddit.name}
                      className="px-2 py-1 bg-[#1A1A1B] rounded text-sm text-gray-400"
                    >
                      r/{subreddit.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
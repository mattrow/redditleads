'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  MessageSquare,
  Users,
  BarChart3,
  Clock,
  ChevronDown,
  Settings,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Sidebar from '@/components/dashboard/Sidebar';

// Import shared types
import { CampaignData } from '@/types';

export default function CampaignDashboard({ params }: { params: { campaignId: string } }) {
  const { campaignId } = params;
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchCampaign = async () => {
      try {
        const campaignRef = doc(db, `users/${user.uid}/campaigns`, campaignId);
        const campaignDoc = await getDoc(campaignRef);

        if (!campaignDoc.exists()) {
          console.error('Campaign not found');
          router.push('/dashboard');
          return;
        }

        const data = campaignDoc.data() as CampaignData;

        setCampaignData({ ...data, id: campaignId });
        setIsRunning(data.status === 'running');
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };

    fetchCampaign();
  }, [user, campaignId, router]);

  const toggleCampaignStatus = async () => {
    if (!user || !campaignData) return;

    try {
      const newStatus = isRunning ? 'paused' : 'running';
      const campaignRef = doc(db, `users/${user.uid}/campaigns`, campaignId);

      await updateDoc(campaignRef, { status: newStatus });

      setIsRunning(!isRunning);
      setCampaignData({ ...campaignData, status: newStatus });
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  if (!campaignData) {
    return <div className="text-white">Loading...</div>;
  }

  if (!campaignData.stats) {
    return <div className="text-white">Campaign data is incomplete.</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#1A1A1B] text-white">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header Bar */}
        <div className="bg-[#242526] border-b border-[#343536] sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">{campaignData.name}</h1>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    isRunning
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}
                >
                  {isRunning ? 'Active' : 'Paused'}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#343536] text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#343536] text-gray-400 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={toggleCampaignStatus}
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isRunning
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-[#FF4500] hover:bg-[#FF5722]'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Resume Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: MessageSquare,
                label: 'Messages Sent',
                value: campaignData.stats.messagesSent.toLocaleString(),
                subtext: `${campaignData.stats.remainingMessages.toLocaleString()} remaining`,
                color: 'text-[#FF4500]',
              },
              {
                icon: Users,
                label: 'Replies Received',
                value: campaignData.stats.replies.toLocaleString(),
                subtext: `${campaignData.stats.replyRate}% reply rate`,
                color: 'text-green-500',
              },
              {
                icon: BarChart3,
                label: 'Total Reach',
                value: campaignData.stats.totalReach.toLocaleString(),
                subtext: 'Potential customers',
                color: 'text-blue-500',
              },
              {
                icon: Clock,
                label: 'Last Active',
                value: new Date(campaignData.lastActive).toLocaleTimeString(),
                subtext: new Date(campaignData.lastActive).toLocaleDateString(),
                color: 'text-purple-500',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-[#242526] rounded-xl border border-[#343536] p-6 hover:border-[#FF4500]/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-4">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-gray-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.subtext}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subreddits Performance */}
            <div className="lg:col-span-2">
              <div className="bg-[#242526] rounded-xl border border-[#343536] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Subreddit Performance</h2>
                  <Button variant="outline" size="sm" className="border-[#343536]">
                    Last 7 Days <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-[#343536]">
                        <th className="pb-4 text-gray-400 font-medium">Subreddit</th>
                        <th className="pb-4 text-gray-400 font-medium">Members</th>
                        <th className="pb-4 text-gray-400 font-medium">Messages</th>
                        <th className="pb-4 text-gray-400 font-medium">Replies</th>
                        <th className="pb-4 text-gray-400 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignData.subreddits.map((subreddit) => (
                        <tr
                          key={subreddit.name}
                          className="border-b border-[#343536] last:border-0"
                        >
                          <td className="py-4">
                            <div className="flex items-center">
                              <span className="text-[#FF4500]">r/</span>
                              {subreddit.name}
                            </div>
                          </td>
                          <td className="py-4">
                            {(subreddit.members / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-4">{subreddit.messagesSent}</td>
                          <td className="py-4">{subreddit.replies}</td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <div
                                className="w-16 h-2 rounded-full bg-[#343536] overflow-hidden mr-2"
                                title={`${subreddit.replyRate}% reply rate`}
                              >
                                <div
                                  className="h-full bg-[#FF4500] rounded-full"
                                  style={{ width: `${subreddit.replyRate}%` }}
                                />
                              </div>
                              <span>{subreddit.replyRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Response Analysis */}
            <div className="bg-[#242526] rounded-xl border border-[#343536] p-6">
              <h2 className="text-xl font-bold mb-6">Response Analysis</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Positive Responses</span>
                    <span>{campaignData.stats.positiveResponses}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#343536]">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${
                          (campaignData.stats.positiveResponses / campaignData.stats.replies) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Neutral Responses</span>
                    <span>{campaignData.stats.neutralResponses}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#343536]">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          (campaignData.stats.neutralResponses / campaignData.stats.replies) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Negative Responses</span>
                    <span>{campaignData.stats.negativeResponses}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#343536]">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{
                        width: `${
                          (campaignData.stats.negativeResponses / campaignData.stats.replies) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#343536]">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Campaign Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-200">Daily Message Limit</span>
                    <span className="text-sm text-gray-400">{campaignData.dailyLimit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-200">Message Template</span>
                    <Button variant="outline" size="sm" className="border-[#343536]">
                      View Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
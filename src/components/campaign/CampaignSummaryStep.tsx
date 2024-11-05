import React from 'react';
import { CampaignData } from '@/types';

interface CampaignSummaryStepProps {
  campaignData: CampaignData;
}

export default function CampaignSummaryStep({
  campaignData,
}: CampaignSummaryStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Campaign</h2>
        <p className="text-gray-400">
          Review your campaign details before launching.
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Name */}
        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Campaign Name</h3>
          <p className="text-white">{campaignData.name}</p>
        </div>

        {/* Selected Subreddits */}
        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Target Subreddits</h3>
          <div className="space-y-2">
            {campaignData.subreddits.map((subreddit) => (
              <div
                key={subreddit.name}
                className="flex items-center justify-between py-2 border-b border-[#343536] last:border-0"
              >
                <span className="text-white">r/{subreddit.name}</span>
                <span className="text-gray-400">
                  {(subreddit.members / 1000000).toFixed(1)}M members
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Reach */}
        <div className="bg-[#FF4500]/10 rounded-lg p-4 border border-[#FF4500]/20">
          <h3 className="text-sm font-medium text-[#FF4500] mb-2">Estimated Reach</h3>
          <p className="text-2xl font-bold text-white">
            {campaignData.totalReach.toLocaleString()}{' '}
            <span className="text-gray-400 text-sm font-normal">potential customers</span>
          </p>
        </div>

        {/* Message Preview */}
        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Message Preview</h3>
          <div className="bg-[#242526] rounded p-4 whitespace-pre-wrap text-white">
            {campaignData.messageTemplate}
          </div>
        </div>
      </div>
    </div>
  );
}
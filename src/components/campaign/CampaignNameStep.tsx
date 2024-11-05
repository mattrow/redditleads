import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CampaignNameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CampaignNameStep({ value, onChange }: CampaignNameStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Name Your Campaign</h2>
        <p className="text-gray-400">
          Choose a name that helps you identify this campaign later.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="campaign-name" className="text-gray-200">
            Campaign Name
          </Label>
          <Input
            id="campaign-name"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Product Launch Q1 2024"
            className="mt-2 bg-[#1A1A1B] border-[#343536] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Tips for naming your campaign:</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Include the target audience or subreddit focus</li>
            <li>• Add a date or time period if relevant</li>
            <li>• Keep it short and descriptive</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
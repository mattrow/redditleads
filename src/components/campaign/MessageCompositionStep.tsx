import React from 'react';
import { Label } from '@/components/ui/label';

interface MessageCompositionStepProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MessageCompositionStep({
  value,
  onChange,
}: MessageCompositionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Compose Your Message</h2>
        <p className="text-gray-400">
          Write a personalized message that will be sent to potential customers.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="message" className="text-gray-200">
            Message Template
          </Label>
          <textarea
            id="message"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Hi {{username}},

I noticed you're active in r/{{subreddit}} and thought you might be interested in..."
            className="mt-2 w-full h-48 px-3 py-2 bg-[#1A1A1B] border border-[#343536] rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF4500] focus:border-[#FF4500]"
          />
        </div>

        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536] space-y-4">
          <h3 className="text-sm font-medium text-gray-200">Available Variables:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <code className="text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded">
                {'{{username}}'}
              </code>
              <p className="text-sm text-gray-400 mt-1">Recipient's username</p>
            </div>
            <div>
              <code className="text-[#FF4500] bg-[#FF4500]/10 px-2 py-1 rounded">
                {'{{subreddit}}'}
              </code>
              <p className="text-sm text-gray-400 mt-1">Subreddit name</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536]">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Writing Tips:</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Keep it personal and friendly</li>
            <li>• Mention why you chose to contact them</li>
            <li>• Be clear about your value proposition</li>
            <li>• Include a specific call-to-action</li>
            <li>• Keep it concise (2-3 paragraphs max)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
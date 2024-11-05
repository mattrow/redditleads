import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { Subreddit } from '@/types';

// Mock data for subreddits
const mockSubreddits = [
  { name: 'startups', members: 1200000 },
  { name: 'entrepreneur', members: 980000 },
  { name: 'smallbusiness', members: 750000 },
  { name: 'marketing', members: 650000 },
  { name: 'saas', members: 120000 },
  { name: 'productivity', members: 890000 },
];

interface SubredditSelectionStepProps {
  selectedSubreddits: Subreddit[];
  onChange: (subreddits: Subreddit[], totalReach: number) => void;
}

export default function SubredditSelectionStep({
  selectedSubreddits,
  onChange,
}: SubredditSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Subreddit[]>([]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = mockSubreddits.filter(
        (subreddit) =>
          subreddit.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedSubreddits.find((s) => s.name === subreddit.name)
      );
      setSuggestions(filtered as Subreddit[]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, selectedSubreddits]);

  const handleSelectSubreddit = (subreddit: Subreddit) => {
    const newSelected = [...selectedSubreddits, subreddit];
    const totalReach = Math.floor(
      newSelected.reduce((sum, s) => sum + s.members, 0) * 0.2
    );
    onChange(newSelected, totalReach);
    setSearchTerm('');
  };

  const handleRemoveSubreddit = (subredditName: string) => {
    const newSelected = selectedSubreddits.filter((s) => s.name !== subredditName);
    const totalReach = Math.floor(
      newSelected.reduce((sum, s) => sum + s.members, 0) * 0.2
    );
    onChange(newSelected, totalReach);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      
      // Remove 'r/' if it exists and clean up the input
      const subredditName = searchTerm.trim().replace(/^r\//, '').toLowerCase();
      
      // Check if already selected
      if (selectedSubreddits.some(s => s.name.toLowerCase() === subredditName)) {
        return;
      }

      // Create new subreddit with default members
      const newSubreddit: Subreddit = {
        name: subredditName,
        members: 100000, // Default member count for manually added subreddits
        replyRate: 0,
        messagesSent: 0,
        replies: 0,
      };

      handleSelectSubreddit(newSubreddit);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Select Subreddits</h2>
        <p className="text-gray-400">
          Choose the subreddits where you want to find potential customers.
        </p>
        <p className="text-gray-400 mt-2">
          <span className="text-[#FF4500]">Tip:</span> Type one subreddit at a time (e.g., r/Entrepreneur) and press Enter to add it
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Label htmlFor="subreddit-search" className="text-gray-200">
            Search or Enter Subreddits
          </Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="subreddit-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type subreddit name and press Enter..."
              className="pl-10 bg-[#1A1A1B] border-[#343536] text-white placeholder:text-gray-500"
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-[#1A1A1B] border border-[#343536] rounded-md shadow-lg">
              {suggestions.map((subreddit) => (
                <button
                  key={subreddit.name}
                  onClick={() => handleSelectSubreddit(subreddit)}
                  className="w-full px-4 py-3 text-left hover:bg-[#343536] flex items-center justify-between group"
                >
                  <span className="text-gray-200">r/{subreddit.name}</span>
                  <span className="text-gray-400 text-sm">
                    {(subreddit.members / 1000000).toFixed(1)}M members
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Subreddits */}
        <div className="space-y-3">
          <Label className="text-gray-200">Selected Subreddits</Label>
          {selectedSubreddits.length === 0 ? (
            <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 text-gray-400 text-center">
              No subreddits selected yet
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSubreddits.map((subreddit) => (
                <div
                  key={subreddit.name}
                  className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-gray-200">r/{subreddit.name}</div>
                    <div className="text-sm text-gray-400">
                      {(subreddit.members / 1000000).toFixed(1)}M members •{' '}
                      {Math.floor(subreddit.members * 0.2).toLocaleString()} potential reach
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSubreddit(subreddit.name)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total Reach */}
        {selectedSubreddits.length > 0 && (
          <div className="bg-[#FF4500]/10 border border-[#FF4500]/20 rounded-md p-4">
            <div className="text-[#FF4500] font-medium">Estimated Total Reach</div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(
                selectedSubreddits.reduce((sum, s) => sum + s.members, 0) * 0.2
              ).toLocaleString()}{' '}
              <span className="text-gray-400 text-sm font-normal">potential customers</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
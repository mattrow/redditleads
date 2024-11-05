import React from 'react';
import { Check, X, Zap } from 'lucide-react';

// Define the props type for the ComparisonItem component
interface ComparisonItemProps {
  title: string;
  redditPrice: React.ReactNode;
  googlePrice: React.ReactNode;
  highlight?: boolean;
}

const ComparisonItem: React.FC<ComparisonItemProps> = ({
  title,
  redditPrice,
  googlePrice,
  highlight = false,
}) => (
  <div
    className={`grid grid-cols-3 gap-4 p-6 ${
      highlight ? 'bg-[#FF4500]/5 backdrop-blur-sm' : ''
    } transition-all duration-300 hover:bg-[#FF4500]/10 border-b border-[#343536] last:border-b-0`}
  >
    <div className="font-medium text-gray-200 flex items-center gap-2">
      {highlight && <Zap className="h-4 w-4 text-[#FF4500]" />}
      {title}
    </div>
    <div className="text-center text-gray-200 font-medium">{redditPrice}</div>
    <div className="text-center text-gray-400">{googlePrice}</div>
  </div>
);

export function ComparisonSection() {
  return (
    <section className="py-24 bg-[#242526] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-[#FF4500]/10 to-transparent opacity-50" />

      <div className="container mx-auto px-4 relative">
        <div className="fade-in opacity-0 translate-y-4 transition-all duration-700">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-200">
            Why Choose RedditLeads?
          </h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto text-lg">
            Get better results at a fraction of the cost compared to traditional advertising
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1A1A1B] rounded-2xl border border-[#343536] overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 p-6 bg-[#2D2D2E] font-bold text-gray-200 border-b border-[#343536]">
              <div className="text-lg">Feature</div>
              <div className="text-center text-[#FF4500] text-lg flex items-center justify-center gap-2">
                RedditLeads
                <span className="px-2 py-1 bg-[#FF4500]/10 rounded-full text-xs">
                  Recommended
                </span>
              </div>
              <div className="text-center text-lg">Google Ads</div>
            </div>

            <ComparisonItem
              title="Cost per 1000 impressions"
              redditPrice={
                <span className="flex items-center justify-center gap-1">
                  <span className="text-[#FF4500] font-bold">$9.90</span>
                </span>
              }
              googlePrice="$38.40"
              highlight={true}
            />
            <ComparisonItem
              title="Direct messaging"
              redditPrice={
                <div className="flex justify-center">
                  <span className="bg-green-500/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-green-500" />
                  </span>
                </div>
              }
              googlePrice={
                <div className="flex justify-center">
                  <span className="bg-red-500/10 p-1 rounded-full">
                    <X className="h-5 w-5 text-red-500" />
                  </span>
                </div>
              }
            />
            <ComparisonItem
              title="Targeting precision"
              redditPrice={
                <span className="px-3 py-1 bg-[#FF4500]/10 rounded-full text-sm">
                  Subreddit-level
                </span>
              }
              googlePrice={
                <span className="px-3 py-1 bg-gray-500/10 rounded-full text-sm">
                  Keyword-based
                </span>
              }
              highlight={true}
            />
            <ComparisonItem
              title="Minimum budget"
              redditPrice={<span className="text-[#FF4500] font-bold">$99</span>}
              googlePrice="$500+"
            />
            <ComparisonItem
              title="Two-way communication"
              redditPrice={
                <div className="flex justify-center">
                  <span className="bg-green-500/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-green-500" />
                  </span>
                </div>
              }
              googlePrice={
                <div className="flex justify-center">
                  <span className="bg-red-500/10 p-1 rounded-full">
                    <X className="h-5 w-5 text-red-500" />
                  </span>
                </div>
              }
              highlight={true}
            />
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center fade-in opacity-0 translate-y-4 transition-all duration-700 delay-200">
            <button className="bg-[#FF4500] hover:bg-[#FF5722] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#FF4500]/20">
              Start Your Campaign Now
            </button>
            <p className="mt-4 text-gray-400">
              No credit card required • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
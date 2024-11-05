import React from 'react';
import { Check, X, Zap, ArrowRight } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  redditLeads: {
    value: string | boolean;
    highlight?: boolean;
    note?: string;
  };
  competitors: {
    value: string | boolean;
    note?: string;
  };
}

const features: ComparisonFeature[] = [
  {
    feature: 'Cost per lead',
    redditLeads: {
      value: '$0.50',
      highlight: true,
      note: 'Targeted, engaged users'
    },
    competitors: {
      value: '$2.80',
      note: 'Higher acquisition costs'
    }
  },
  {
    feature: 'Response rate',
    redditLeads: {
      value: '35%',
      highlight: true,
      note: 'Active community members'
    },
    competitors: {
      value: '8%',
      note: 'Cold outreach'
    }
  },
  {
    feature: 'Audience targeting',
    redditLeads: {
      value: true,
      note: 'Interest-based communities'
    },
    competitors: {
      value: false,
      note: 'Broad demographics'
    }
  },
  {
    feature: 'Direct messaging',
    redditLeads: {
      value: true,
      highlight: true,
      note: 'Personal conversations'
    },
    competitors: {
      value: false,
      note: 'Limited interaction'
    }
  },
  {
    feature: 'Minimum budget',
    redditLeads: {
      value: '$99',
      note: 'Start small, scale up'
    },
    competitors: {
      value: '$500+',
      note: 'High entry barrier'
    }
  }
];

export function ComparisonSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#1A1A1B] to-[#242526]">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF4500]/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            The RedditLeads Advantage
          </h2>
          <p className="text-xl text-gray-400">
            See how we compare to traditional lead generation methods
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1A1A1B]/80 backdrop-blur-xl rounded-2xl border border-[#343536] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 p-8 border-b border-[#343536]">
              <div className="text-lg font-medium text-gray-200">Feature</div>
              <div className="text-center">
                <div className="text-[#FF4500] font-bold text-lg mb-1">RedditLeads</div>
                <div className="inline-block px-3 py-1 bg-[#FF4500]/10 rounded-full text-[#FF4500] text-sm">
                  Recommended
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 font-medium text-lg mb-1">Competitors</div>
                <div className="inline-block px-3 py-1 bg-gray-500/10 rounded-full text-gray-400 text-sm">
                  Industry Average
                </div>
              </div>
            </div>

            {/* Features */}
            {features.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 gap-4 p-8 border-b border-[#343536] last:border-0 transition-colors hover:bg-white/[0.02] ${
                  item.redditLeads.highlight ? 'bg-[#FF4500]/[0.02]' : ''
                }`}
              >
                <div className="flex items-center">
                  <span className="text-gray-200 font-medium">{item.feature}</span>
                </div>

                <div className="text-center">
                  {typeof item.redditLeads.value === 'boolean' ? (
                    <div className="flex justify-center">
                      {item.redditLeads.value ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full">
                          <Check className="w-5 h-5 text-green-500" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500/10 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-[#FF4500] font-bold text-xl mb-1">
                        {item.redditLeads.value}
                      </div>
                      {item.redditLeads.note && (
                        <div className="text-sm text-gray-400">{item.redditLeads.note}</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {typeof item.competitors.value === 'boolean' ? (
                    <div className="flex justify-center">
                      {item.competitors.value ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500/10 rounded-full">
                          <Check className="w-5 h-5 text-green-500" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500/10 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-400 font-bold text-xl mb-1">
                        {item.competitors.value}
                      </div>
                      {item.competitors.note && (
                        <div className="text-sm text-gray-500">{item.competitors.note}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button className="group inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#FF5722] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:gap-4">
              Start Finding Leads
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <p className="mt-4 text-gray-400">
              Try risk-free with our 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
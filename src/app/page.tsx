'use client';

import React, { useEffect } from 'react';
import {
  MessageSquare,
  Target,
  Users,
  Zap,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Rocket,
  Brain,
  Heart,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ComparisonSection } from '@/components/ComparisonSection';
import { TestimonialSection } from '@/components/TestimonialSection';
import Link from 'next/link';

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1B] text-gray-200">
      <div className="fixed inset-0 bg-gradient-to-b from-[#FF4500]/5 via-transparent to-transparent pointer-events-none" />
      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="fade-in opacity-0 translate-y-4 transition-all duration-700">
              <div className="inline-flex items-center gap-2 bg-[#FF4500]/10 px-4 py-2 rounded-full text-[#FF4500] mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Discover your audience on Reddit</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Turn <span className="text-[#FF4500]">Reddit Users</span> Into Your{' '}
                <span className="relative">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#FF4500] to-[#FF7A45] blur-sm opacity-50"></span>
                  <span className="relative bg-gradient-to-r from-[#FF4500] to-[#FF7A45] inline-block text-transparent bg-clip-text">
                    Most Valuable
                  </span>
                </span>{' '}
                Customers
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Connect with <span className="text-white font-medium">real users</span>, get{' '}
                <span className="text-white font-medium">instant feedback</span>, and{' '}
                <span className="text-white font-medium">validate your ideas</span> in targeted
                subreddits perfect for your product.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/signup">
                  <button className="bg-[#FF4500] hover:bg-[#FF5722] text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#FF4500]/20">
                    Start Finding Customers
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </Link>
                <button className="text-gray-200 hover:text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 transition-colors border border-[#343536] hover:border-[#FF4500]">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#FF4500]" />
                  <span>50k+ Users Reached</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#FF4500]" />
                  <span>1M+ Messages Sent</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="bg-[#242526] py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Founders Love RedditLeads</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Get real conversations with potential customers, not just analytics data
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: 'Validate Ideas Fast',
                  description:
                    'Get instant feedback from your target audience before building. Save time and money.',
                },
                {
                  icon: Target,
                  title: 'Find Perfect Fit Users',
                  description:
                    'Target specific subreddits where your ideal customers already hang out.',
                },
                {
                  icon: Heart,
                  title: 'Build Relationships',
                  description:
                    'Have real conversations and turn Reddit users into loyal customers.',
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="fade-in opacity-0 translate-y-4 transition-all duration-700 p-6 rounded-xl bg-[#1A1A1B] border border-[#343536] hover:border-[#FF4500] group hover:-translate-y-1 transition-all duration-300"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-12 w-12 text-[#FF4500]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Steps */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Your Path to Customer Discovery</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Three simple steps to connect with potential customers
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: Target,
                  title: '1. Find Your Audience',
                  description:
                    'Choose from thousands of active subreddits where your potential customers hang out.',
                },
                {
                  icon: MessageCircle,
                  title: '2. Start Conversations',
                  description:
                    'Send personalized messages to users who are most likely to be interested in your product.',
                },
                {
                  icon: Rocket,
                  title: '3. Grow & Scale',
                  description:
                    'Convert interested users into customers and scale your outreach as you grow.',
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="fade-in opacity-0 translate-y-4 transition-all duration-700 text-center relative"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="flex justify-center mb-6">
                    <div className="transform hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-16 w-16 text-[#FF4500]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <ChevronRight className="h-8 w-8 text-[#FF4500]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <ComparisonSection />
        <TestimonialSection />

        {/* CTA Section */}
        <section className="bg-[#242526] py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto fade-in">
              <h2 className="text-4xl font-bold mb-6">Ready to Find Your First Customers? 🚀</h2>
              <p className="text-xl text-gray-400 mb-8">
                Join hundreds of founders who are building their businesses with RedditLeads ✨
              </p>
              <Link href="/signup">
                <button className="bg-[#FF4500] hover:bg-[#FF5722] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#FF4500]/20 flex items-center gap-2 mx-auto">
                  Get Started Now
                  <ChevronRight className="h-5 w-5" />
                </button>
              </Link>
              <p className="mt-4 text-gray-400">
                No credit card required ✅ • 30-day money-back guarantee 💯
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#343536] py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageSquare className="text-[#FF4500] h-6 w-6" />
            <span className="text-xl font-bold">RedditLeads</span>
          </div>
          <p>© 2024 RedditLeads. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
import React from 'react';
import { MessageSquare } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-[#343536] p-4 fixed w-full bg-[#1A1A1B]/95 backdrop-blur-sm z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-[#FF4500] h-8 w-8" />
          <span className="text-2xl font-bold text-gray-200">RedditLeads</span>
        </div>
        <button className="bg-[#FF4500] hover:bg-[#FF5722] text-white px-6 py-2 rounded-full font-medium transition-colors">
          Get Started
        </button>
      </div>
    </nav>
  );
} 
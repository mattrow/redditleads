import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Startup Founder',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
    content:
      'RedditLeads helped us find our first 100 customers in just 2 weeks. The targeting capabilities are incredible!',
  },
  {
    name: 'Mark Thompson',
    role: 'Marketing Director',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    content:
      'We saw a 300% better engagement rate compared to our traditional marketing channels.',
  },
  {
    name: 'Lisa Wong',
    role: 'Product Manager',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
    content:
      'The feedback we got from Reddit users helped us pivot our product in the right direction. Invaluable!',
  },
];

export function TestimonialSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-200">
          Trusted by Growing Businesses
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#242526] p-6 rounded-lg border border-[#343536] transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#FF4500] text-[#FF4500]"
                  />
                ))}
              </div>
              <p className="text-gray-400 mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-gray-200">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
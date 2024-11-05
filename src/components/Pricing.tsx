'use client';
// import { Button } from "@/components/ui/button";
import { Check, Shield, Zap, Users, BookOpen, MessageSquare, Brain } from "lucide-react";
import { useState } from "react";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
import { loadStripe } from "@stripe/stripe-js";

interface PricingProps {
  userId: string;
  userEmail: string;
  onSubscribe: (priceId: string) => Promise<void>;
}

export default function Pricing({ userId, userEmail, onSubscribe }: PricingProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          metadata: {
            userId,
            email: userEmail,
            role: 'Pro User',
          },
        }),
      });

      const { sessionId, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI-Powered Lesson Planning",
      description: "Generate personalized lesson plans in seconds"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Up to 5 Students",
      description: "Manage a limited number of students for free"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "CEFR-Aligned Content",
      description: "Professional curriculum standards"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Unlimited Resources",
      description: "Access all lesson planning features"
    }
  ];

  const proFeatures = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Unlimited Students",
      description: "Grow your tutoring business without limits"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Smart Feedback System",
      description: "Track progress and optimize learning"
    }
  ];

  const faqs = [
    {
      question: "Is there a free plan?",
      answer: "Yes! Our Free Plan allows you to manage up to 5 students with unlimited access to resources."
    },
    {
      question: "What does the Professional Plan offer?",
      answer: "The Professional Plan includes unlimited students and additional features like the Smart Feedback System."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes! Cancel anytime from your account settings. You'll continue to have access until the end of your billing period."
    },
    {
      question: "Is my payment secure?",
      answer: "Absolutely. We use Stripe for secure payment processing—the same system trusted by Amazon, Google, and Microsoft."
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-satoshi-black text-white mb-6">
            Choose the Plan That's Right for You
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Start for free and upgrade anytime to unlock more features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Free Plan */}
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 w-full max-w-md hover:border-white/40 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-white mb-4">Free Plan</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">Free</span>
              </div>
              <div className="text-gray-200 font-medium">&nbsp;</div>
            </div>

            {/* <Button
              onClick={() => {/* Navigate to sign-up page 
              className="w-full bg-white text-[#396afc] hover:bg-white/90 py-6 px-8 text-xl rounded-2xl font-bold h-auto hover:scale-105 transition-all duration-300"
            >
              Get Started for Free
            </Button> 
            */}

            <div className="space-y-4 mb-2 mt-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-white/70">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Plan */}
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 w-full max-w-md md:-mt-6 hover:border-white/40 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-white mb-4">Professional Plan</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-white/80">/month</span>
              </div>
              <div className="text-gray-200 font-medium">&nbsp;</div>
            </div>

            {/* <Button
              onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!)}
              disabled={isLoading}
              className="w-full bg-white text-[#396afc] hover:bg-white/90 py-6 px-8 text-xl rounded-2xl font-bold h-auto hover:scale-105 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#396afc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </Button> */}

            <div className="mt-2 mb-8 flex items-center justify-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant access</span>
              </div>
            </div>

            <div className="space-y-4 mb-2 mt-6">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm text-white/70">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Common Questions</h3>
          {/* <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20"
              >
                <AccordionTrigger className="text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/80">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion> */}
        </div>
      </div>
    </section>
  );
}
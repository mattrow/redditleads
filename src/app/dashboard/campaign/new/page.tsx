'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import CampaignNameStep from '@/components/campaign/CampaignNameStep';
import SubredditSelectionStep from '@/components/campaign/SubredditSelectionStep';
import MessageCompositionStep from '@/components/campaign/MessageCompositionStep';
import CampaignSummaryStep from '@/components/campaign/CampaignSummaryStep';
import { Button } from '@/components/ui/button';
import { addDoc, collection } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase/config';
import { CampaignData } from '@/types';

// Define the Subreddit interface


export default function NewCampaign() {
  const router = useRouter();
  const { user } = useAuth();

  // Initialize campaignData with the defined type
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    status: 'paused',
    stats: {
      messagesSent: 0,
      replies: 0,
      replyRate: 0,
      totalReach: 0,
      remainingMessages: 0,
      positiveResponses: 0,
      negativeResponses: 0,
      neutralResponses: 0,
    },
    subreddits: [],
    totalReach: 0,
    lastActive: new Date().toISOString(),
    dailyLimit: 100,
    messageTemplate: '',
  });

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, title: 'Name Your Campaign' },
    { number: 2, title: 'Select Subreddits' },
    { number: 3, title: 'Compose Message' },
    { number: 4, title: 'Review & Create' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Reference to the user's campaigns collection
      const campaignsRef = collection(db, `users/${user.uid}/campaigns`);

      // Add the new campaign to Firestore
      const campaignDocRef = await addDoc(campaignsRef, {
        ...campaignData,
        createdAt: Date.now(),
      });

      // Redirect to the new campaign's page
      router.push(`/dashboard/campaign/${campaignDocRef.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  // Update function with the correct type
  const updateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'border-[#FF4500] text-[#FF4500]'
                      : 'border-[#343536] text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <div
                  className={`ml-2 text-sm ${
                    currentStep >= step.number ? 'text-gray-200' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 mx-4 ${
                      currentStep > step.number ? 'bg-[#FF4500]' : 'bg-[#343536]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#242526] rounded-2xl border border-[#343536] p-8">
          {currentStep === 1 && (
            <CampaignNameStep
              value={campaignData.name}
              onChange={(name) => updateCampaignData({ name })}
            />
          )}
          {currentStep === 2 && (
            <SubredditSelectionStep
              selectedSubreddits={campaignData.subreddits}
              onChange={(subreddits, totalReach) =>
                    updateCampaignData({ subreddits, totalReach })
              }
            />
          )}
          {currentStep === 3 && (
            <MessageCompositionStep
              value={campaignData.messageTemplate}
              onChange={(messageTemplate) => updateCampaignData({ messageTemplate })}
            />
          )}
          {currentStep === 4 && (
            <CampaignSummaryStep campaignData={campaignData} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
                disabled={
                  (currentStep === 1 && !campaignData.name) ||
                  (currentStep === 2 && campaignData.subreddits.length === 0) ||
                  (currentStep === 3 && !campaignData.messageTemplate)
                }
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-[#FF4500] hover:bg-[#FF5722]">
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
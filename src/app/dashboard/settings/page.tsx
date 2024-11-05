'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  User, 
  MessageSquare, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserPlan {
  name: string;
  messagesLeft: number;
  totalMessages: number;
  nextRenewal?: string;
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<UserPlan>({
    name: 'Free Plan',
    messagesLeft: 25,
    totalMessages: 100,
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

        <div className="grid gap-6">
          {/* Account Info */}
          <div className="bg-[#242526] rounded-xl border border-[#343536] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#FF4500]" />
                <h2 className="text-lg font-medium text-white">Account Information</h2>
              </div>
              <Button
                variant="outline"
                className="border-[#343536] text-gray-400 hover:text-white"
                onClick={() => router.push('/dashboard/settings/profile')}
              >
                Edit Profile
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-[#343536]">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#343536]">
                <span className="text-gray-400">Account Created</span>
                <span className="text-white">
                  {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Last Sign In</span>
                <span className="text-white">
                  {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Message Credits */}
          <div className="bg-[#242526] rounded-xl border border-[#343536] p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-[#FF4500]" />
              <h2 className="text-lg font-medium text-white">Message Credits</h2>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Messages Remaining</span>
                <span className="text-xl font-bold text-white">{userPlan.messagesLeft}</span>
              </div>
              <div className="w-full h-2 bg-[#343536] rounded-full">
                <div 
                  className="h-full bg-[#FF4500] rounded-full"
                  style={{ width: `${(userPlan.messagesLeft / userPlan.totalMessages) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {userPlan.messagesLeft} of {userPlan.totalMessages} messages remaining this month
              </p>
            </div>

            <div className="bg-[#1A1A1B] rounded-lg p-4 border border-[#343536] mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF4500]" />
                  <span className="font-medium text-white">Current Plan</span>
                </div>
                <span className="text-[#FF4500] font-medium">{userPlan.name}</span>
              </div>
              {userPlan.nextRenewal && (
                <p className="text-sm text-gray-400">
                  Next renewal on {new Date(userPlan.nextRenewal).toLocaleDateString()}
                </p>
              )}
            </div>

            <Button 
              className="w-full bg-[#FF4500] hover:bg-[#FF5722] text-white"
              onClick={() => router.push('/dashboard/settings/upgrade')}
            >
              Upgrade Plan
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-[#242526] rounded-xl border border-[#343536] p-6 text-left hover:border-[#FF4500]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-[#FF4500]" />
                <h3 className="font-medium text-white">Billing & Payments</h3>
              </div>
              <p className="text-sm text-gray-400">Manage your payment methods and billing history</p>
            </button>

            <button className="bg-[#242526] rounded-xl border border-[#343536] p-6 text-left hover:border-[#FF4500]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-5 h-5 text-[#FF4500]" />
                <h3 className="font-medium text-white">Notifications</h3>
              </div>
              <p className="text-sm text-gray-400">Configure your notification preferences</p>
            </button>

            <button className="bg-[#242526] rounded-xl border border-[#343536] p-6 text-left hover:border-[#FF4500]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-[#FF4500]" />
                <h3 className="font-medium text-white">Security</h3>
              </div>
              <p className="text-sm text-gray-400">Manage your account security settings</p>
            </button>

            <button 
              onClick={handleLogout}
              className="bg-[#242526] rounded-xl border border-[#343536] p-6 text-left hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <LogOut className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-white">Sign Out</h3>
              </div>
              <p className="text-sm text-gray-400">Sign out of your account</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { handleGoogleAuth } from '@/utils/auth/googleSignIn';
import { MessageSquare } from 'lucide-react';
import { analytics } from '@/firebase/config';
import { logEvent } from 'firebase/analytics';
import { Navbar } from '@/components/Navbar';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore
      await saveUserDataToFirestore(user);

      // Redirect to campaign onboarding
      router.push("/dashboard/campaign/new");
    } catch (error) {
      console.error('Error signing up', error);
      alert(
        error instanceof Error
          ? error.message
          : 'An error occurred during registration'
      );
    }
  };

  // Function to save user data to Firestore
  const saveUserDataToFirestore = async (user: User) => {
    const { uid, email } = user;
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email,
      role: "Free User",
      credits: 100, // Set initial credits
      createdAt: Date.now(),
    });
  };

  const handleGoogleSignUp = async () => {
    try {
      await handleGoogleAuth();
      if (analytics) {
        logEvent(analytics, 'sign_up', {
          method: 'Google',
        });
      }
      router.push("/dashboard");
    } catch (error) {
      console.error('Error signing up with Google:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during Google sign-up');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1B]">
      <Navbar />

      <div className="flex flex-col pt-24 justify-center items-center">
        <main className="w-full max-w-md p-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400">Start finding your customers on Reddit</p>
          </div>

          <div className="bg-[#242526]/50 backdrop-blur-xl rounded-xl border border-[#343536] p-8">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1A1A1B] border-[#343536] text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:ring-[#FF4500] rounded-xl"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1A1A1B] border-[#343536] text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:ring-[#FF4500] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-200">Confirm Password</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#1A1A1B] border-[#343536] text-white placeholder:text-gray-500 focus:border-[#FF4500] focus:ring-[#FF4500] rounded-xl"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" className="border-[#343536] data-[state=checked]:bg-[#FF4500] data-[state=checked]:border-[#FF4500] rounded-md" />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#FF4500] hover:text-[#FF5722]">
                    terms and conditions
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full bg-[#FF4500] hover:bg-[#FF5722] text-white rounded-xl">
                Create Account
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#343536]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#242526]/50 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                className="w-full bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-600 border-[#343536] rounded-xl"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FF4500] hover:text-[#FF5722]">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
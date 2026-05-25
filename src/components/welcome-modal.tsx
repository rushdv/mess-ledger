"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, X, ArrowRight, CheckCircle2 } from "lucide-react";

interface WelcomeModalProps {
  isNewMess?: boolean;
  messName?: string;
}

// WelcomeModal component provides an onboarding guide for new and joined mess members
export function WelcomeModal({ isNewMess = false, messName = "your mess" }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    
    if (!hasSeenWelcome) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setOpen(false);
  };

  const handleViewGuide = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setOpen(false);
    router.push("/help");
  };

  const handleGetStarted = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setOpen(false);
    router.push("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="mx-4 max-w-2xl rounded-2xl sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              🎉 Welcome to Mess Ledger!
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <DialogDescription className="text-base">
            {isNewMess 
              ? `আপনি সফলভাবে "${messName}" mess তৈরি করেছেন! 🎊`
              : `আপনি সফলভাবে "${messName}" mess এ যুক্ত হয়েছেন! 🎊`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Start Guide */}
          <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-5">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              শুরু করার আগে জেনে নিন
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mess Ledger সহজে ব্যবহার করার জন্য আমরা একটি সম্পূর্ণ guide তৈরি করেছি। 
              এখানে আপনি পাবেন:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">কিভাবে meal entry করবেন</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">কিভাবে bazar খরচ add করবেন</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">কিভাবে bill manage করবেন</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">কিভাবে report তৈরি করবেন</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">User roles বুঝুন</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm">মাসিক workflow</span>
              </div>
            </div>
          </div>

          {/* Role Info */}
          {isNewMess && (
            <div className="rounded-xl border bg-amber-50 dark:bg-amber-950 p-4">
              <p className="text-sm">
                <span className="font-semibold">🔱 আপনি Admin:</span> আপনি এই mess এর সম্পূর্ণ নিয়ন্ত্রণ পাবেন। 
                আপনি member add করতে, moderator বানাতে, এবং সব data manage করতে পারবেন।
              </p>
            </div>
          )}

          {/* Quick Tips */}
          <div className="rounded-xl border p-4 space-y-2">
            <h4 className="font-semibold text-sm">💡 Quick Tips:</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>প্রতিদিন meal count এবং bazar খরচ entry করুন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>মাস শেষে report calculate করে PDF download করুন</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Member দের payment পাওয়ার সাথে সাথে entry করুন</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleViewGuide}
              className="flex-1 rounded-xl h-12 text-base"
              variant="default"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              View Complete Guide
            </Button>
            <Button
              onClick={handleGetStarted}
              className="flex-1 rounded-xl h-12 text-base"
              variant="outline"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Skip for now (আপনি পরে More → Help & Guide থেকে দেখতে পারবেন)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

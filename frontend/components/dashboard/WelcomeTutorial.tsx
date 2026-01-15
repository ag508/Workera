'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
  feature: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: Briefcase,
    title: 'Create Job Requisitions',
    description:
      'Post new job openings with AI-powered job description generation. Our AI helps you craft compelling job postings that attract top talent.',
    feature: 'Jobs',
  },
  {
    icon: Users,
    title: 'Manage Candidates',
    description:
      'View, filter, and manage all your candidates in one place. Import candidates from various sources including LinkedIn and Workday.',
    feature: 'Candidates',
  },
  {
    icon: MessageSquare,
    title: 'Communicate with Candidates',
    description:
      'Send messages, schedule interviews, and keep all communications organized in your inbox.',
    feature: 'Inbox',
  },
  {
    icon: Calendar,
    title: 'Schedule Interviews',
    description:
      'Easily schedule interviews with candidates. Sync with Google Calendar and send automated reminders.',
    feature: 'Interviews',
  },
  {
    icon: BarChart3,
    title: 'Track Your Pipeline',
    description:
      'Get real-time insights into your hiring pipeline with comprehensive analytics and reporting.',
    feature: 'Analytics',
  },
  {
    icon: Settings,
    title: 'Configure Integrations',
    description:
      'Connect with LinkedIn, Workday, Indeed, and more to streamline your recruitment workflow.',
    feature: 'Settings',
  },
];

interface WelcomeTutorialProps {
  userName?: string;
}

export function WelcomeTutorial({ userName = 'there' }: WelcomeTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if tutorial should be shown
    const checkTutorialStatus = async () => {
      const token = localStorage.getItem('recruiter_token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/users/onboarding/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Show tutorial if onboarding is complete but tutorial not dismissed
          if (data.completed && !data.tutorialDismissed) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to check tutorial status:', error);
      }
    };

    checkTutorialStatus();
  }, []);

  const handleDismiss = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('recruiter_token');

    try {
      await fetch(`${API_BASE_URL}/users/tutorial/dismiss`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Failed to dismiss tutorial:', error);
    }

    setIsVisible(false);
    setIsLoading(false);
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-6 text-white relative">
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium opacity-90">
                Welcome to Workera
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              Hi {userName}! Let's get you started
            </h2>
            <p className="text-white/80 mt-2">
              Here's a quick tour of what you can do with Workera
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 py-4 bg-gray-50">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <StepIcon className="h-8 w-8 text-primary" />
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  {step.feature}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

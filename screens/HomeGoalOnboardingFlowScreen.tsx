import React, { useState } from 'react';
import HomeGoalOnboardingWelcomeScreen from './HomeGoalOnboardingWelcomeScreen';
import HomeGoalOnboardingSetupScreen from './HomeGoalOnboardingSetupScreen';
import HomeGoalOnboardingHowItWorksScreen from './HomeGoalOnboardingHowItWorksScreen';
import HomeGoalOnboardingPreviewScreen from './HomeGoalOnboardingPreviewScreen';
import HomeGoalOnboardingInviteScreen from './HomeGoalOnboardingInviteScreen';

interface HomeGoalOnboardingFlowScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

type OnboardingStep = 'welcome' | 'setup' | 'howItWorks' | 'preview' | 'invite';

export default function HomeGoalOnboardingFlowScreen({
  onComplete,
  onBack,
}: HomeGoalOnboardingFlowScreenProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [goalData, setGoalData] = useState<{
    amount: number;
    timeline: number;
    nickname: string;
    monthlyContribution: number;
  } | null>(null);

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('setup');
        break;
      case 'setup':
        setCurrentStep('howItWorks');
        break;
      case 'howItWorks':
        setCurrentStep('preview');
        break;
      case 'preview':
        setCurrentStep('invite');
        break;
      case 'invite':
        onComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'welcome':
        onBack();
        break;
      case 'setup':
        setCurrentStep('welcome');
        break;
      case 'howItWorks':
        setCurrentStep('setup');
        break;
      case 'preview':
        setCurrentStep('howItWorks');
        break;
      case 'invite':
        setCurrentStep('preview');
        break;
    }
  };

  const handleSetupComplete = (data: {
    amount: number;
    timeline: number;
    nickname: string;
    monthlyContribution: number;
  }) => {
    setGoalData(data);
    handleNext();
  };

  const handleSkipInvite = () => {
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <HomeGoalOnboardingWelcomeScreen onNext={handleNext} />;
      
      case 'setup':
        return (
          <HomeGoalOnboardingSetupScreen
            onNext={handleSetupComplete}
            onBack={handleBack}
          />
        );
      
      case 'howItWorks':
        return (
          <HomeGoalOnboardingHowItWorksScreen
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case 'preview':
        return (
          <HomeGoalOnboardingPreviewScreen
            onNext={handleNext}
            onBack={handleBack}
            goalData={goalData!}
          />
        );
      
      case 'invite':
        return (
          <HomeGoalOnboardingInviteScreen
            onComplete={onComplete}
            onSkip={handleSkipInvite}
            onBack={handleBack}
          />
        );
      
      default:
        return <HomeGoalOnboardingWelcomeScreen onNext={handleNext} />;
    }
  };

  return renderCurrentStep();
}

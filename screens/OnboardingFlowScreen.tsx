import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utente } from '../src/types';
import NewOnboardingScreen1 from './NewOnboardingScreen1';
import NewOnboardingScreen2 from './NewOnboardingScreen2';
import NewOnboardingScreen3 from './NewOnboardingScreen3';
import NewOnboardingScreen4 from './NewOnboardingScreen4';
import NewOnboardingScreen5 from './NewOnboardingScreen5';
import NewOnboardingScreen6 from './NewOnboardingScreen6';
import NewOnboardingScreen7 from './NewOnboardingScreen7';
import RoommateSelectionScreen from './RoommateSelectionScreen';
import RoommatePreferencesScreen1 from './RoommatePreferencesScreen1';
import RoommatePreferencesScreen2 from './RoommatePreferencesScreen2';
import RoommatePreferencesSummaryScreen from './RoommatePreferencesSummaryScreen';

interface OnboardingFlowScreenProps {
  user: Utente;
  onComplete: (onboardingData?: any) => void;
}

type OnboardingStep = 
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step6'
  | 'step7'
  | 'roommateSelection'
  | 'roommatePrefs1'
  | 'roommatePrefs2'
  | 'roommateSummary';

const TOTAL_STEPS = 7;

export default function OnboardingFlowScreen({ user, onComplete }: OnboardingFlowScreenProps) {
  // Initialize role from user's current role, defaulting to 'tenant'
  const initialRole = user?.ruolo === 'landlord' || user?.userType === 'homeowner' ? 'landlord' : 
                      user?.ruolo === 'tenant' || user?.userType === 'tenant' ? 'tenant' : 
                      'tenant';
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('step1');
  const [onboardingData, setOnboardingData] = useState({
    role: initialRole as 'tenant' | 'landlord' | 'roommate',
    intention: null as 'house' | 'room' | 'roommate' | null,
    preferences: {} as any,
    roommatePreferences: {} as any,
  });

  const handleStep1Next = () => {
    setCurrentStep('step2');
  };

  const handleStep2Next = (role: 'tenant' | 'landlord' | 'roommate') => {
    setOnboardingData(prev => ({ ...prev, role }));
    setCurrentStep('step3');
  };

  const handleStep3Next = (intention: 'house' | 'room' | 'roommate') => {
    setOnboardingData(prev => ({ ...prev, intention }));
    setCurrentStep('step4');
  };

  const handleStep4Next = (preferences: any) => {
    setOnboardingData(prev => ({ ...prev, preferences }));
    setCurrentStep('step5');
  };

  const handleStep5Next = () => {
    setCurrentStep('step6');
  };

  const handleStep6Next = () => {
    setCurrentStep('step7');
  };

  const handleStep7Complete = () => {
    // After step 7, show roommate selection
    setCurrentStep('roommateSelection');
  };

  const handleRoommateSelection = (wantsRoommate: boolean) => {
    if (wantsRoommate) {
      setCurrentStep('roommatePrefs1');
    } else {
      // Skip roommate preferences and complete onboarding
      finalizeOnboarding();
    }
  };

  const handleRoommatePrefs1Next = (prefs1: any) => {
    setOnboardingData(prev => ({ 
      ...prev, 
      roommatePreferences: { ...prev.roommatePreferences, ...prefs1 } 
    }));
    setCurrentStep('roommatePrefs2');
  };

  const handleRoommatePrefs2Next = (prefs2: any) => {
    setOnboardingData(prev => ({ 
      ...prev, 
      roommatePreferences: { ...prev.roommatePreferences, ...prefs2 } 
    }));
    setCurrentStep('roommateSummary');
  };

  const handleRoommateSummaryComplete = (summary: any) => {
    setOnboardingData(prev => ({ 
      ...prev, 
      roommatePreferences: { ...prev.roommatePreferences, ...summary } 
    }));
    finalizeOnboarding();
  };

  const finalizeOnboarding = () => {
    // Save all onboarding data to Supabase
    // Pass onboarding data (including role) to parent to handle updates
    onComplete(onboardingData);
  };

  const getStepNumber = (step: OnboardingStep): number => {
    const stepMap: Record<OnboardingStep, number> = {
      'step1': 1,
      'step2': 2,
      'step3': 3,
      'step4': 4,
      'step5': 5,
      'step6': 6,
      'step7': 7,
    };
    return stepMap[step];
  };

  const renderCurrentStep = () => {
    const stepNumber = getStepNumber(currentStep);
    
    switch (currentStep) {
      case 'step1':
        return (
          <NewOnboardingScreen1
            onNext={handleStep1Next}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
          />
        );
      
      case 'step2':
        return (
          <NewOnboardingScreen2
            onNext={handleStep2Next}
            onBack={() => setCurrentStep('step1')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
            initialData={{ role: onboardingData.role }}
          />
        );
      
      case 'step3':
        return (
          <NewOnboardingScreen3
            onNext={handleStep3Next}
            onBack={() => setCurrentStep('step2')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
            initialData={{ intention: onboardingData.intention }}
          />
        );
      
      case 'step4':
        return (
          <NewOnboardingScreen4
            onNext={handleStep4Next}
            onBack={() => setCurrentStep('step3')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
            initialData={onboardingData.preferences}
          />
        );
      
      case 'step5':
        return (
          <NewOnboardingScreen5
            onNext={handleStep5Next}
            onBack={() => setCurrentStep('step4')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
          />
        );
      
      case 'step6':
        return (
          <NewOnboardingScreen6
            onNext={handleStep6Next}
            onBack={() => setCurrentStep('step5')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
          />
        );
      
      case 'step7':
        return (
          <NewOnboardingScreen7
            onComplete={handleStep7Complete}
            onBack={() => setCurrentStep('step6')}
            step={stepNumber}
            totalSteps={TOTAL_STEPS}
          />
        );
      
      case 'roommateSelection':
        return (
          <RoommateSelectionScreen
            onNext={handleRoommateSelection}
            onBack={() => setCurrentStep('step7')}
            initialData={{ wantsRoommate: onboardingData.roommatePreferences?.wantsRoommate }}
          />
        );
      
      case 'roommatePrefs1':
        return (
          <RoommatePreferencesScreen1
            onNext={handleRoommatePrefs1Next}
            onBack={() => setCurrentStep('roommateSelection')}
            step={1}
            totalSteps={3}
            initialData={onboardingData.roommatePreferences}
          />
        );
      
      case 'roommatePrefs2':
        return (
          <RoommatePreferencesScreen2
            onNext={handleRoommatePrefs2Next}
            onBack={() => setCurrentStep('roommatePrefs1')}
            step={2}
            totalSteps={3}
            initialData={onboardingData.roommatePreferences}
          />
        );
      
      case 'roommateSummary':
        return (
          <RoommatePreferencesSummaryScreen
            onComplete={handleRoommateSummaryComplete}
            onBack={() => setCurrentStep('roommatePrefs2')}
            step={3}
            totalSteps={3}
            preferences={onboardingData.roommatePreferences}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {renderCurrentStep()}
    </SafeAreaView>
  );
}





import React, { useState } from 'react';
import { Utente } from '../src/types';
import OnboardingDiscoverScreen from './OnboardingDiscoverScreen';
import OnboardingProfileScreen from './OnboardingProfileScreen';
import OnboardingFiltersScreen1 from './OnboardingFiltersScreen1';
import OnboardingFiltersScreen2 from './OnboardingFiltersScreen2';
import OnboardingVerificationScreen from './OnboardingVerificationScreen';
import IDVerificationScreen from './IDVerificationScreen';
import OnboardingConfirmationScreen from './OnboardingConfirmationScreen';

interface TenantOnboardingFlowScreenProps {
  user: Utente;
  onComplete: (data: {
    profile: any;
    filters: any;
    idVerification: any;
  }) => void;
  onCancel: () => void;
}

type Step =
  | 'discover'
  | 'profile'
  | 'filters1'
  | 'filters2'
  | 'verificationIntro'
  | 'verification'
  | 'confirm';

const TOTAL_STEPS = 4;

export default function TenantOnboardingFlowScreen({
  user,
  onComplete,
  onCancel,
}: TenantOnboardingFlowScreenProps) {
  const [step, setStep] = useState<Step>('discover');
  const [profile, setProfile] = useState<any | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [idVerification, setIdVerification] = useState<any | null>(null);

  if (step === 'discover') {
    return (
      <OnboardingDiscoverScreen
        step={1}
        totalSteps={TOTAL_STEPS}
        onBack={onCancel}
        onComplete={() => setStep('profile')}
      />
    );
  }

  if (step === 'profile') {
    return (
      <OnboardingProfileScreen
        user={user}
        step={2}
        totalSteps={TOTAL_STEPS}
        onBack={() => setStep('discover')}
        onNext={(data) => {
          setProfile(data);
          setStep('filters1');
        }}
      />
    );
  }

  if (step === 'filters1') {
    return (
      <OnboardingFiltersScreen1
        step={3}
        totalSteps={TOTAL_STEPS}
        onBack={() => setStep('profile')}
        onNext={(data) => {
          setFilters(data);
          setStep('filters2');
        }}
      />
    );
  }

  if (step === 'filters2') {
    return (
      <OnboardingFiltersScreen2
        step={4}
        totalSteps={TOTAL_STEPS}
        initialData={filters}
        onBack={() => setStep('filters1')}
        onNext={(data) => {
          setFilters((prev: any) => ({ ...prev, ...data }));
          setStep('verificationIntro');
        }}
      />
    );
  }

  if (step === 'verificationIntro') {
    return (
      <OnboardingVerificationScreen
        step={4}
        totalSteps={TOTAL_STEPS}
        onBack={() => setStep('filters2')}
        onNext={() => setStep('verification')}
        onSkip={() => setStep('confirm')}
      />
    );
  }

  if (step === 'verification') {
    return (
      <IDVerificationScreen
        user={user}
        onBack={() => setStep('verificationIntro')}
        onComplete={(data) => {
          setIdVerification(data);
          setStep('confirm');
        }}
      />
    );
  }

  return (
    <OnboardingConfirmationScreen
      user={user}
      onboardingData={{
        preferences: filters,
        personalDetails: profile,
        idVerification,
      }}
      onBack={() => setStep('verificationIntro')}
      onComplete={() => {
        onComplete({
          profile,
          filters,
          idVerification,
        });
      }}
    />
  );
}

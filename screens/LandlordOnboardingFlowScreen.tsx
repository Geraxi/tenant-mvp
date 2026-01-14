import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utente } from '../src/types';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import CreateListingScreen from './CreateListingScreen';
import LandlordPreferencesScreen from './LandlordPreferencesScreen';
import ListingReviewScreen from './ListingReviewScreen';
import ListingSuccessScreen from './ListingSuccessScreen';

interface LandlordOnboardingFlowScreenProps {
  user: Utente;
  onComplete: (data: {
    personalDetails: any;
    propertyDraft: any;
    preferences: any;
  }) => void;
  onCancel: () => void;
}

type Step = 'personal' | 'property' | 'review' | 'success' | 'preferences';

export default function LandlordOnboardingFlowScreen({
  user,
  onComplete,
  onCancel,
}: LandlordOnboardingFlowScreenProps) {
  const [step, setStep] = useState<Step>('personal');
  const [personalDetails, setPersonalDetails] = useState<any | null>(null);
  const [propertyDraft, setPropertyDraft] = useState<any | null>(null);

  if (step === 'personal') {
    return (
      <PersonalDetailsScreen
        user={user}
        onComplete={(details) => {
          setPersonalDetails(details);
          setStep('property');
        }}
        onBack={onCancel}
      />
    );
  }

  if (step === 'property') {
    return (
      <CreateListingScreen
        onBack={() => setStep('personal')}
        onSave={(property) => {
          setPropertyDraft(property);
          setStep('review');
        }}
      />
    );
  }

  if (step === 'review') {
    return (
      <ListingReviewScreen
        property={propertyDraft || {}}
        onBack={() => setStep('property')}
        onEdit={() => setStep('property')}
        onPublish={() => setStep('success')}
      />
    );
  }

  if (step === 'success') {
    return (
      <ListingSuccessScreen
        onExploreMatches={() => setStep('preferences')}
        onViewListing={() => setStep('review')}
        onGoToTenantPreferences={() => setStep('preferences')}
        onGoToDashboard={() => setStep('preferences')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LandlordPreferencesScreen
        onComplete={(preferences) => {
          onComplete({
            personalDetails,
            propertyDraft,
            preferences,
          });
        }}
        onSkip={() => {
          onComplete({
            personalDetails,
            propertyDraft,
            preferences: null,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

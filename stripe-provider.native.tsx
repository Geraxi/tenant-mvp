import React from 'react';
import { StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';

interface StripeProviderProps {
  publishableKey: string;
  merchantIdentifier: string;
  urlScheme: string;
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({
  publishableKey,
  merchantIdentifier,
  urlScheme,
  children,
}) => (
  <RNStripeProvider
    publishableKey={publishableKey}
    merchantIdentifier={merchantIdentifier}
    urlScheme={urlScheme}
  >
    {children}
  </RNStripeProvider>
);

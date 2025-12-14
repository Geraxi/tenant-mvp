import React from 'react';

interface StripeProviderProps {
  publishableKey: string;
  merchantIdentifier: string;
  urlScheme: string;
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => (
  <>{children}</>
);

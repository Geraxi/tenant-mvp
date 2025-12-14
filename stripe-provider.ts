import { Platform } from 'react-native';
import { StripeProvider as WebStripeProvider } from './stripe-provider.web';
import { StripeProvider as NativeStripeProvider } from './stripe-provider.native';

export const StripeProvider = Platform.OS === 'web' ? WebStripeProvider : NativeStripeProvider;

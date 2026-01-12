import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Temporarily disabled
import { View, StyleSheet, Alert, AppState, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import './global.css';
import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import createTokenCache from './lib/tokenCache';
import { useSupabaseAuth } from './src/hooks/useSupabaseAuth';
import { Utente, Immobile } from './src/types';
import { logger } from './src/utils/logger';

// Complete the OAuth session in the browser
// This must be called at the top level before any OAuth flows
WebBrowser.maybeCompleteAuthSession();

// Platform-specific Stripe imports - Metro automatically picks .web.tsx for web and .native.tsx for native
import { StripeProvider } from './stripe-provider';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignInScreen from './screens/SignInScreen';
// Old onboarding removed - using new flow
import RoleSwitchOnboardingScreen from './screens/RoleSwitchOnboardingScreen';
import PropertySwipeScreen from './screens/PropertySwipeScreen';

// Test if PropertySwipeScreen is imported correctly
console.log('🔍 App.tsx - PropertySwipeScreen imported:', typeof PropertySwipeScreen);
import LandlordSwipeScreen from './screens/LandlordSwipeScreen';
import MatchesScreen, { MatchWithDetails } from './screens/MatchesScreen';
import MatchDetailScreen from './screens/MatchDetailScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfiloScreen from './screens/ProfiloScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';
import HomeownerOnboardingScreen from './screens/HomeownerOnboardingScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import FiltersScreen from './screens/FiltersScreen';
import BottomNavigation from './components/BottomNavigation';
import SplashScreen from './components/SplashScreen';
import RoleSwitchLoadingScreen from './components/RoleSwitchLoadingScreen';
import OnboardingFlowScreen from './screens/OnboardingFlowScreen';
import LandlordOnboardingFlowScreen from './screens/LandlordOnboardingFlowScreen';
import TenantOnboardingFlowScreen from './screens/TenantOnboardingFlowScreen';
import GestioneImmobiliScreen from './screens/GestioneImmobiliScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';

type Screen = 
  | 'login'
  | 'onboarding'
  | 'homeownerOnboarding'
  | 'discover'
  | 'matches'
  | 'matchDetail'
  | 'messages'
  | 'profilo'
  | 'settings'
  | 'editProfile'
  | 'help'
  | 'preferences'
  | 'filters'
  | 'properties'
  | 'addProperty'
  | 'propertyDetails';

type NavScreen = 'discover' | 'properties' | 'matches' | 'messages' | 'profilo';


function AppContent() {
  const {
    user,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
    switchRole,
    completeOnboarding,
    reloadUserFromStorage,
    updateProfile,
  } = useSupabaseAuth();
  // Also check Clerk auth state
  const { isSignedIn: isClerkSignedIn, isLoaded: isClerkLoaded, userId: clerkUserId } = useClerkAuth();
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:72',message:'Clerk auth state',data:{isClerkSignedIn,isClerkLoaded,clerkUserId:clerkUserId||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, [isClerkSignedIn, isClerkLoaded, clerkUserId]);
  // #endregion
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debug user loading and role changes
  useEffect(() => {
    console.log('🔍 App.tsx - User state changed:', user);
    console.log('🔍 App.tsx - Auth loading:', authLoading);
    if (user) {
      const userRole = user.userType || user.ruolo;
      console.log('🔍 App.tsx - User role from userType:', user.userType);
      console.log('🔍 App.tsx - User role from ruolo:', user.ruolo);
      console.log('🔍 App.tsx - Final user role:', userRole);
      console.log('🔍 App.tsx - Current screen:', currentScreen);
    }
  }, [user?.userType, user?.ruolo, authLoading, currentScreen]);
  const [showHomeownerOnboarding, setShowHomeownerOnboarding] = useState(false);
  const [forceNavbar, setForceNavbar] = useState(false);
  const [roleSwitchTarget, setRoleSwitchTarget] = useState<'tenant' | 'landlord' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRoleSwitching, setIsRoleSwitching] = useState(false);
  const [appRefreshKey, setAppRefreshKey] = useState(0);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);
  const [switchingToRole, setSwitchingToRole] = useState<'tenant' | 'landlord' | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Immobile | null>(null);
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  const [messageTargetUserName, setMessageTargetUserName] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // NEW: Centralized role state management - derive from user directly
  const currentRole = user ? (
    user.userType === 'homeowner' || user.ruolo === 'homeowner' ? 'landlord' : 
    user.userType || user.ruolo
  ) : null;

  // Add timeout to prevent infinite loading - MUST be before any early returns
  useEffect(() => {
    if (isLoading || authLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        setIsLoading(false); // Force stop loading after 5 seconds
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading, authLoading]);

  // Debug user state changes in App
  useEffect(() => {
    console.log('App - User state changed:', user);
    console.log('App - Derived currentRole:', currentRole);
  }, [user, currentRole]);

  useEffect(() => {
    // Initialize app
    initializeApp();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const initializeApp = async () => {
    try {
      // Wait for auth to load, but with a timeout to prevent infinite loading
      let authCheckCount = 0;
      const maxAuthChecks = 30; // 3 seconds max wait
      
      while (authLoading && authCheckCount < maxAuthChecks) {
        await new Promise(resolve => setTimeout(resolve, 100));
        authCheckCount++;
      }

      // Even if auth is still loading after timeout, proceed anyway
      console.log('Auth loading check complete. authLoading:', authLoading, 'checks:', authCheckCount);

      // Check if user has completed onboarding from AsyncStorage
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      const hasCompleted = onboardingCompleted === 'true';
      setHasCompletedOnboarding(hasCompleted);

      console.log('Initializing app with user:', !!user);
      console.log('Initializing app with Clerk auth:', { isClerkSignedIn, isClerkLoaded, clerkUserId });

      // Check both Supabase and Clerk auth
      const hasUser = user || (isClerkLoaded && isClerkSignedIn);
      
      if (hasUser) {
        // User is logged in (either via Supabase or Clerk), check if they need onboarding
        console.log('User found, checking onboarding status:', hasCompleted);
        if (!hasCompleted) {
          setCurrentScreen('onboarding');
        } else {
          setCurrentScreen('discover');
        }
      } else {
        // No user, show login
        console.log('No user found, showing login');
        setCurrentScreen('login');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setCurrentScreen('login');
    } finally {
      // Always set loading to false, even if there was an error
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Re-initialize when auth state changes (Supabase or Clerk)
  useEffect(() => {
    if (isInitialized) {
      initializeApp();
    }
  }, [user, authLoading, isClerkLoaded, isClerkSignedIn, clerkUserId]);

  // Handle navigation to onboarding after signup when user becomes available
  const [pendingOnboardingNavigation, setPendingOnboardingNavigation] = useState(false);
  
  useEffect(() => {
    if (pendingOnboardingNavigation && user) {
      console.log('User available after signup, navigating to onboarding');
      setPendingOnboardingNavigation(false);
      setCurrentScreen('onboarding');
    }
  }, [pendingOnboardingNavigation, user]);

  // Fallback: if we're waiting for user after signup but it takes too long, navigate anyway
  useEffect(() => {
    if (pendingOnboardingNavigation) {
      const timeout = setTimeout(() => {
        console.log('Timeout waiting for user after signup, navigating to onboarding anyway');
        setPendingOnboardingNavigation(false);
        setCurrentScreen('onboarding');
      }, 2000); // 2 second timeout
      return () => clearTimeout(timeout);
    }
  }, [pendingOnboardingNavigation]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading && !authLoading) {
      const timeout = setTimeout(() => {
        console.log('Loading timeout - forcing initialization');
        setIsLoading(false);
        setIsInitialized(true);
        if (!user) {
          setCurrentScreen('login');
        }
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, authLoading, user]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        // Check if user has completed onboarding
        const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
        const hasCompleted = onboardingCompleted === 'true';
        
        if (hasCompleted) {
          setCurrentScreen('discover');
        } else {
          // Old onboarding removed - redirect to discover instead
          setCurrentScreen('discover');
        }
      } else {
        Alert.alert('Errore', result.error || 'Email o password non corretti');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Errore', 'Errore durante il login. Riprova.');
    }
  };

  const handleSignup = async (email: string, password: string, nome: string, ruolo: 'tenant' | 'landlord') => {
    try {
      const result = await signUp(email, password, nome, ruolo);
      if (result.success) {
        setCurrentScreen('onboarding');
      } else {
        Alert.alert('Errore', result.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Errore', 'Errore durante la registrazione. Riprova.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await signOut();
      
      // Clear all local state
      setHasCompletedOnboarding(false);
      setCurrentScreen('login');
      setForceNavbar(false);
      setShowHomeownerOnboarding(false);
      setRoleSwitchTarget(null);
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Errore', 'Errore durante il logout');
    }
  };

  const handleRoleSwitch = async (newRole: 'tenant' | 'landlord') => {
    try {
      console.log('🔄 Starting role switch to:', newRole);
      
      // Switch the role in the user object
      const result = await switchRole(newRole);
      console.log('🔄 switchRole result:', result.success ? 'success' : 'failed');
      
      if (result.success) {
        console.log('✅ Role switch successful');
        
        // Force refresh to ensure UI updates
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
        
        // Navigate to discover to see the changes
        setCurrentScreen('discover');
        
      } else {
        console.error('❌ Role switch failed:', result.error);
        Alert.alert('Errore', result.error || 'Impossibile cambiare account');
      }
    } catch (error) {
      console.error('❌ Role switch error:', error);
      Alert.alert('Errore', 'Impossibile cambiare account');
    }
  };

  const handleRoleSwitchTimeout = () => {
    console.log('🔄 Role switch timeout, using fast refresh...');
    setAppRefreshKey(prev => prev + 10000);
    setRefreshKey(prev => prev + 10000);
    setRoleSwitchLoading(false);
    setSwitchingToRole(null);
    setIsRoleSwitching(false);
  };

  const handleHomeownerOnboardingComplete = async (preferences: any, filters: any, firstListing: any) => {
    try {
      // Complete the onboarding
      const result = await completeOnboarding('landlord');
      if (result.success) {
        setShowHomeownerOnboarding(false);
        setCurrentScreen('discover');
        // TODO: Save preferences, filters, and create first listing
        console.log('Homeowner onboarding completed with:', { preferences, filters, firstListing });
      }
    } catch (error) {
      console.error('Homeowner onboarding completion error:', error);
    }
  };

  const handleNavigation = (screen: NavScreen) => {
    console.log('🚀 handleNavigation called with screen:', screen);
    console.log('🚀 Current currentScreen state:', currentScreen);
    console.log('🚀 User exists:', !!user);
    console.log('🚀 User role:', user?.userType || user?.ruolo);
    console.log('🚀 User object:', user);
    console.log('🚀 handleNavigation - About to set currentScreen to:', screen);
    
    switch (screen) {
      case 'discover':
        console.log('🔄 NAVIGATING TO DISCOVER SCREEN');
        console.log('🔄 Current role:', currentRole);
        console.log('🔄 User exists:', !!user);
        
        // Reset role switching states when navigating to discover
        setIsRoleSwitching(false);
        setRoleSwitchLoading(false);
        setSwitchingToRole(null);
        
        // Force refresh to ensure UI updates
        setRefreshKey(prev => prev + 1);
        setAppRefreshKey(prev => prev + 1);
        
        setCurrentScreen('discover');
        break;
      case 'matches':
        setCurrentScreen('matches');
        break;
      case 'messages':
        setCurrentScreen('messages');
        break;
      case 'properties':
        setCurrentScreen('properties');
        break;
      case 'profilo':
        setCurrentScreen('profilo');
        break;
    }
  };

  const getCurrentNavScreen = (): NavScreen => {
    switch (currentScreen) {
      case 'discover':
        return 'discover';
      case 'matches':
        return 'matches';
      case 'messages':
        return 'messages';
      case 'properties':
      case 'addProperty':
      case 'propertyDetails':
        return 'properties';
      case 'profilo':
      case 'settings':
      case 'editProfile':
        return 'profilo';
      default:
        return 'discover';
    }
  };

  const showBottomNav = !!user && !['login', 'onboarding', 'homeownerOnboarding', 'settings', 'editProfile', 'help', 'preferences', 'filters', 'addProperty', 'propertyDetails'].includes(currentScreen);
  
  // Show navbar for main navigation screens (but not during onboarding)
  const shouldShowNavbar =
    showBottomNav ||
    (forceNavbar && !!user && !['login', 'onboarding', 'homeownerOnboarding'].includes(currentScreen));
  console.log('App - Should show navbar:', shouldShowNavbar);
  
  // Simplified user state monitoring (no more complex refresh logic)
  useEffect(() => {
    console.log('App - User state changed:', { 
      user: !!user, 
      currentRole,
      userName: user?.name || user?.nome,
      currentScreen
    });
  }, [user, currentRole, currentScreen]);

  useEffect(() => {
    if (!user) {
      setForceNavbar(false);
    }
  }, [user]);
  
  // Force refresh when currentRole changes - DISABLED TO PREVENT INFINITE LOOP
  // useEffect(() => {
  //   if (currentRole) {
  //     console.log('🔄 currentRole changed to:', currentRole, '- forcing refresh');
  //     setRefreshKey(prev => prev + 1);
  //     setAppRefreshKey(prev => prev + 1);
  //   }
  // }, [currentRole]);
  
  // Debug logging
  console.log('App - Current screen:', currentScreen);
  console.log('App - User state:', !!user);
  console.log('App - Current role:', currentRole);
  console.log('App - Show bottom nav:', showBottomNav);
  console.log('App - Excluded screens check:', ['login', 'matches', 'settings', 'editProfile', 'help', 'preferences', 'filters'].includes(currentScreen));

  // Show loading screen while initializing
  if (showSplash) {
    return <SplashScreen onAnimationFinish={handleSplashFinish} />;
  }

    // Show role switch loading screen
    if (roleSwitchLoading && switchingToRole) {
      return <RoleSwitchLoadingScreen newRole={switchingToRole} onTimeout={handleRoleSwitchTimeout} />;
    }

  if ((isLoading || authLoading) && !loadingTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  // If loading timed out, show login screen
  if (loadingTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Timeout. Redirecting to login...</Text>
        {(() => {
          setTimeout(() => {
            setCurrentScreen('login');
            setLoadingTimeout(false);
          }, 1000);
          return null;
        })()}
      </View>
    );
  }

  const renderScreen = () => {
    console.log('🔍 RENDERSCREEN - Current screen:', currentScreen);
    console.log('🔍 RENDERSCREEN - User exists:', !!user);
    console.log('🔍 RENDERSCREEN - Current role:', currentRole);
    console.log('🔍 RENDERSCREEN - About to switch on currentScreen:', currentScreen);
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - checking onboarding status');
              setForceNavbar(true);
              await reloadUserFromStorage();
              const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
              const hasCompleted = onboardingCompleted === 'true';
              
              setTimeout(() => {
                if (hasCompleted) {
                  console.log('Onboarding completed, navigating to home');
                  setCurrentScreen('discover');
                } else {
                  console.log('Onboarding not completed, navigating to onboarding');
                  setCurrentScreen('discover');
                }
              }, 100);
            }}
            onSignupSuccess={async () => {
              console.log('Signup success - will navigate to onboarding when user is available');
              setForceNavbar(true);
              await reloadUserFromStorage();
              setPendingOnboardingNavigation(true);
              if (user) {
                setPendingOnboardingNavigation(false);
                setCurrentScreen('onboarding');
              }
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );

      case 'onboarding':
        if (!user) {
          // User not available yet, show loading
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{ marginTop: 16, color: '#666' }}>Caricamento...</Text>
            </View>
          );
        }
        return roleSwitchTarget ? (
          <RoleSwitchOnboardingScreen
            user={user}
            targetRole={roleSwitchTarget}
            onComplete={async () => {
              try {
                // Mark role-specific onboarding as completed
                await AsyncStorage.setItem(`${roleSwitchTarget}_onboarding_completed`, 'true');
                setRoleSwitchTarget(null);
                setCurrentScreen('discover');
              } catch (error) {
                console.error('Error saving role switch onboarding completion:', error);
                setRoleSwitchTarget(null);
                setCurrentScreen('discover');
              }
            }}
            onSkip={() => {
              setRoleSwitchTarget(null);
              setCurrentScreen('discover');
            }}
          />
        ) : (
          (user?.ruolo === 'landlord' || user?.userType === 'homeowner') ? (
            <LandlordOnboardingFlowScreen
              user={user}
              onCancel={() => setCurrentScreen('login')}
              onComplete={async (data) => {
                const details = data?.personalDetails || {};
                const fullName = [details.nome, details.cognome].filter(Boolean).join(' ').trim();
                const addressParts = [details.indirizzo, details.cap, details.citta].filter(Boolean).join(', ');

                await updateProfile({
                  nome: fullName || user.nome,
                  telefono: details.telefono || user.telefono,
                  data_nascita: details.dataNascita || user.data_nascita,
                  indirizzo: addressParts || user.indirizzo,
                  bio: details.bio || user.bio,
                  foto: details.foto || user.foto,
                  ruolo: 'landlord',
                  userType: 'homeowner',
                });

                await completeOnboarding('landlord');
                setCurrentScreen('discover');
              }}
            />
          ) : (user?.ruolo === 'tenant' || user?.userType === 'tenant') ? (
            <TenantOnboardingFlowScreen
              user={user}
              onCancel={() => setCurrentScreen('login')}
              onComplete={async (data) => {
                const details = data?.profile || {};
                await updateProfile({
                  nome: details.nome || user.nome,
                  bio: details.bio || user.bio,
                  foto: details.foto || user.foto,
                  ruolo: 'tenant',
                  userType: 'tenant',
                });
                await completeOnboarding('tenant');
                setCurrentScreen('discover');
              }}
            />
          ) : (
            <OnboardingFlowScreen
              user={user}
              onComplete={async (onboardingData) => {
                const selectedRole = onboardingData?.role === 'landlord' ? 'landlord' : 'tenant';
                await updateProfile({
                  ruolo: selectedRole,
                  userType: selectedRole === 'landlord' ? 'homeowner' : 'tenant',
                });
                await completeOnboarding(selectedRole);
                setCurrentScreen('discover');
              }}
            />
          )
        );

      case 'homeownerOnboarding':
        return user ? (
          <HomeownerOnboardingScreen
            user={user}
            onComplete={handleHomeownerOnboardingComplete}
            onBack={() => {
              setShowHomeownerOnboarding(false);
              setCurrentScreen('discover');
            }}
          />
        ) : null;


      case 'discover':
        console.log('🔍 DISCOVER CASE - About to render discover screen');
        console.log('🔍 DISCOVER CASE - Current role:', currentRole);
        console.log('🔍 DISCOVER CASE - User exists:', !!user);
        
        // Show loading if auth is still loading or user is not available
        if (authLoading || !user) {
          console.log('🔍 DISCOVER CASE - Showing loading screen');
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={{ fontSize: 16, color: '#666', marginTop: 20 }}>
                Caricamento...
              </Text>
            </View>
          );
        }

        // Show appropriate content based on centralized role
        console.log('🔍 DISCOVER CASE - Using currentRole:', currentRole);
        console.log('🔍 DISCOVER CASE - User ruolo:', user.ruolo);
        console.log('🔍 DISCOVER CASE - User userType:', user.userType);
        
        // Ensure role is set - if not, default to tenant
        const effectiveRole = currentRole || 'tenant';
        console.log('🔍 DISCOVER CASE - Effective role:', effectiveRole);
        
        if (effectiveRole === 'tenant') {
          console.log('🔍 DISCOVER CASE - Rendering PropertySwipeScreen for tenant');
          
          return (
            <PropertySwipeScreen
              key={`property-swipe-${effectiveRole}-${user?.id}-${refreshKey}`}
              onNavigateToMatches={() => setCurrentScreen('matches')}
              onNavigateToProfile={() => setCurrentScreen('profilo')}
              onNavigateToDiscover={() => setCurrentScreen('discover')}
              onNavigateToOnboarding={(role) => setCurrentScreen('onboarding')}
              onRoleSwitch={handleRoleSwitch}
            />
          );
        } else if (effectiveRole === 'landlord') {
          console.log('🔍 DISCOVER CASE - Rendering LandlordSwipeScreen for landlord');
          
          return (
            <LandlordSwipeScreen
              key={`landlord-swipe-${currentRole}-${user?.id}-${refreshKey}`}
              onNavigateToMatches={() => setCurrentScreen('matches')}
              onNavigateToProfile={() => setCurrentScreen('profilo')}
              onNavigateToDiscover={() => setCurrentScreen('discover')}
              onNavigateToOnboarding={(role) => setCurrentScreen('onboarding')}
              onRoleSwitch={handleRoleSwitch}
            />
          );
        } else {
          console.log('🔍 DISCOVER CASE - Unknown role, showing fallback');
          console.log('🔍 DISCOVER CASE - currentRole value:', currentRole);
          console.log('🔍 DISCOVER CASE - currentRole === undefined:', currentRole === undefined);
          console.log('🔍 DISCOVER CASE - currentRole === null:', currentRole === null);
          
          // Show a simple fallback screen
          return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff3cd' }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, color: '#856404', marginBottom: 20 }}>
                  ⚠️ FALLBACK SCREEN
                </Text>
                <Text style={{ fontSize: 16, color: '#666', marginBottom: 10 }}>
                  Current role: {currentRole || 'undefined'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
                  This is a fallback screen
                </Text>
                <TouchableOpacity 
                  style={{ backgroundColor: '#ffc107', padding: 15, borderRadius: 8, marginTop: 20 }}
                  onPress={() => {
                    console.log('🔍 FALLBACK - Button pressed');
                    Alert.alert('Fallback', 'Fallback screen is working!');
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    Fallback Button
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          );
        }

      case 'matches':
        return (
          <MatchesScreen
            onNavigateBack={() => setCurrentScreen('discover')}
            onNavigateToDetail={(match) => {
              setSelectedMatch(match);
              setCurrentScreen('matchDetail');
            }}
            onNavigateToMessages={(userId, userName) => {
              setMessageTargetUserId(userId);
              setMessageTargetUserName(userName);
              setCurrentScreen('messages');
            }}
          />
        );

      case 'matchDetail':
        if (!selectedMatch || !user) {
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          );
        }
        const currentUserRole = user.userType === 'homeowner' || user.ruolo === 'homeowner' ? 'landlord' : (user.userType || user.ruolo || 'tenant');
        return (
          <MatchDetailScreen
            match={selectedMatch}
            currentUserId={user.id}
            currentUserRole={currentUserRole as 'tenant' | 'landlord'}
            onBack={() => setCurrentScreen('matches')}
            onContact={(otherUserId, otherUserName) => {
              setMessageTargetUserId(otherUserId);
              setMessageTargetUserName(otherUserName);
              setCurrentScreen('messages');
            }}
          />
        );

      case 'messages':
        return (
          <MessagesScreen
            onNavigateBack={() => {
              setMessageTargetUserId(null);
              setMessageTargetUserName(null);
              setCurrentScreen('discover');
            }}
            targetUserId={messageTargetUserId}
            targetUserName={messageTargetUserName}
          />
        );

      case 'profilo':
        return (
          <ProfiloScreen
            onNavigateToEditProfile={() => setCurrentScreen('editProfile')}
            onNavigateToVerification={() => {
              // TODO: Implement verification screen
              Alert.alert('Info', 'Verifica identità in arrivo');
            }}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            onLogout={handleLogout}
            onBack={() => setCurrentScreen('discover')}
            onRoleSwitch={handleRoleSwitch}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
            onLogout={handleLogout}
          />
        );

      case 'editProfile':
        return (
          <EditProfileScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
          />
        );

      case 'help':
        return (
          <HelpCenterScreen
            onNavigateBack={() => setCurrentScreen('discover')}
          />
        );

      case 'preferences':
        return (
          <PreferencesScreen
            onNavigateBack={() => setCurrentScreen('profilo')}
          />
        );

      case 'filters':
        return (
          <FiltersScreen
            onNavigateBack={() => setCurrentScreen('discover')}
          />
        );

      case 'properties':
        return (
          <GestioneImmobiliScreen
            onBack={() => setCurrentScreen('discover')}
            onNavigateToAddProperty={() => setCurrentScreen('addProperty')}
            onNavigateToPropertyDetails={(immobile) => {
              setSelectedProperty(immobile);
              setCurrentScreen('propertyDetails');
            }}
          />
        );

      case 'addProperty':
        return (
          <CreateListingScreen
            onBack={() => setCurrentScreen('properties')}
            onSave={() => {
              Alert.alert('Annuncio salvato', 'Il tuo annuncio è stato salvato con successo.');
              setCurrentScreen('properties');
            }}
          />
        );

      case 'propertyDetails':
        return (
          <PropertyDetailsScreen
            immobile={selectedProperty}
            onBack={() => setCurrentScreen('properties')}
          />
        );

      case 'tenants':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <MaterialIcons name="people" size={64} color="#2196F3" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
              Gestione Inquilini
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
              Questa schermata sarà disponibile presto per gestire i tuoi inquilini.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 30 }}
              onPress={() => setCurrentScreen('discover')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Torna alla Home
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'income':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
            <MaterialIcons name="receipt" size={64} color="#2196F3" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
              Gestione Entrate
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 }}>
              Questa schermata sarà disponibile presto per visualizzare le tue entrate.
            </Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#2196F3', padding: 15, borderRadius: 8, marginTop: 30 }}
              onPress={() => setCurrentScreen('discover')}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Torna alla Home
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <LoginScreen
            onLoginSuccess={async () => {
              console.log('Login success - checking onboarding status');
              setForceNavbar(true);
              await reloadUserFromStorage();
              // Check if user has completed onboarding
              const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
              const hasCompleted = onboardingCompleted === 'true';
              
              // Small delay to ensure user state is set
              setTimeout(() => {
                if (hasCompleted) {
                  console.log('Onboarding completed, navigating to home');
                  setCurrentScreen('discover');
                } else {
                  console.log('Onboarding not completed, navigating to onboarding');
                  setCurrentScreen('onboarding');
                }
              }, 100);
            }}
            onSignupSuccess={async () => {
              console.log('Signup success - will navigate to onboarding when user is available');
              setForceNavbar(true);
              await reloadUserFromStorage();
              setPendingOnboardingNavigation(true);
              if (user) {
                setPendingOnboardingNavigation(false);
                setCurrentScreen('onboarding');
              }
            }}
            onNavigateToSignup={() => Alert.alert('Info', 'Registrazione sarà disponibile presto')}
          />
        );
    }
  };

  return (
    <SafeAreaProvider key={`app-${appRefreshKey}`}>
        <View style={styles.container} key={`container-${appRefreshKey}`}>
          {showHomeownerOnboarding ? (
            <HomeownerOnboardingScreen
              user={user!}
              onComplete={handleHomeownerOnboardingComplete}
              onBack={() => {
                setShowHomeownerOnboarding(false);
                setCurrentScreen('discover');
              }}
            />
          ) : (
            <>
              {renderScreen()}
              {shouldShowNavbar && (
                <BottomNavigation
                  key={`navbar-${currentRole}-${refreshKey}`}
                  currentScreen={getCurrentNavScreen()}
                  onNavigate={handleNavigation}
                  showContracts={currentRole === 'landlord'}
                  userRole={currentRole || 'tenant'}
                />
              )}
            </>
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaProvider>
  );
}

export default function App() {
  // Get Clerk publishable key from environment
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:906',message:'App component render',data:{hasPublishableKey:!!clerkPublishableKey,keyLength:clerkPublishableKey?.length||0,keyPrefix:clerkPublishableKey?.substring(0,10)||'missing',isEmpty:!clerkPublishableKey||clerkPublishableKey.trim()===''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Block app if publishable key is missing or empty
  if (!clerkPublishableKey || clerkPublishableKey.trim() === '') {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:911',message:'Missing publishable key error',data:{hasPublishableKey:!!clerkPublishableKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.error('[App] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing or empty!');
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Configuration Error</Text>
        <Text style={styles.errorMessage}>
          Clerk publishable key is not configured.{'\n\n'}
          Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file.
        </Text>
        <Text style={styles.errorInstructions}>
          The key should start with "pk_test_" or "pk_live_"
        </Text>
      </View>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:928',message:'Rendering ClerkProvider',data:{hasPublishableKey:!!clerkPublishableKey,keyPrefix:clerkPublishableKey?.substring(0,10)||'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={createTokenCache()}
    >
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
        merchantIdentifier="merchant.com.mytenant.tenantapp"
        urlScheme="tenant"
      >
        <AppContent />
      </StripeProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorInstructions: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

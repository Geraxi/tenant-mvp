import { useState, useEffect } from 'react';
import { supabase } from '../../utils/src/supabaseClient';
import { Utente } from '../types';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../utils/logger';

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppleSignIn, setIsAppleSignIn] = useState(false);

  useEffect(() => {
    // Add some test users for development
    addTestUsers();
    
    // Load current user from local storage first
    loadCurrentUserFromStorage().then((loadedUser) => {
      if (loadedUser) {
        // User was loaded from storage, we're done
        logger.debug('✅ User loaded from storage, skipping session check');
        return;
      }
      
      // Only check session if no user was loaded from storage
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      });
    });

    // Listen for auth changes - disabled for local storage auth
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     logger.debug('Auth state change:', { event, hasSession: !!session, isAppleSignIn, currentUser: !!user });
    //     setSession(session);
    //     if (session?.user) {
    //       await fetchUserProfile(session.user.id, session.user.email);
    //     } else if (!isAppleSignIn && event !== 'INITIAL_SESSION' && event !== 'SIGNED_OUT') {
    //       // Only reset user if it's not an Apple Sign In, not initial session, and not a sign out event
    //       // Also check if we have a user in local storage before resetting
    //       const hasLocalUser = await checkIfUserExists('any@email.com'); // This will check if any users exist
    //       if (!hasLocalUser) {
    //         logger.debug('Resetting user state (no local users found)');
    //         setUser(null);
    //       } else {
    //         logger.debug('Keeping user state (local users exist)');
    //       }
    //       setLoading(false);
    //     } else {
    //       logger.debug('Skipping user reset (Apple Sign In in progress, initial session, or sign out)');
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, [isAppleSignIn]);

  // Debug user state changes
  useEffect(() => {
    const userRole = user?.userType || user?.ruolo;
    logger.debug('useSupabaseAuth - User state changed:', { 
      user: !!user, 
      userData: user,
      userType: user?.userType,
      ruolo: user?.ruolo,
      finalRole: userRole,
      name: user?.name || user?.nome,
      roleType: typeof userRole,
      roleEqualsTenant: userRole === 'tenant',
      roleEqualsLandlord: userRole === 'landlord' || userRole === 'homeowner'
    });
    
    // Force update the role in the user object if it's missing
    if (user && user.userType && !user.ruolo) {
      logger.debug('🔧 Fixing user role - adding ruolo field');
      const updatedUser = { ...user, ruolo: user.userType };
      setUser(updatedUser);
      // Also save to storage
      AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
    
    // Also ensure userType is set if only ruolo exists
    if (user && user.ruolo && !user.userType) {
      logger.debug('🔧 Fixing user type - adding userType field');
      const updatedUser = { 
        ...user, 
        userType: user.ruolo === 'landlord' ? 'homeowner' : user.ruolo 
      };
      setUser(updatedUser);
      // Also save to storage
      AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      // Don't use stored role preference here - use default tenant role
      logger.debug('🔍 fetchUserProfile called - not using stored role preference');

      // Try to fetch from utenti table, but handle case when it doesn't exist
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.debug('utenti table not found, creating mock user profile');
        // Create a mock user profile for now - use tenant as default
        const email = userEmail || session?.user?.email || '';
        const mockUser: Utente = {
          id: userId,
          ruolo: 'tenant', // Always use tenant as default
          nome: email.split('@')[0] || 'Utente',
          email: email,
          verificato: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }

      // Use database role, don't override with stored preference
      logger.debug('🔍 Using database role:', data.ruolo);
      setUser(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Create a mock user profile as fallback - use tenant as default
      const email = userEmail || session?.user?.email || '';
      const mockUser: Utente = {
        id: userId,
        ruolo: 'tenant', // Always use tenant as default
        userType: 'tenant',
        nome: email.split('@')[0] || 'Utente',
        email: email,
        verificato: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, ruolo: 'tenant' | 'landlord') => {
    try {
      setLoading(true);
      
      // Validate input
      if (!email || !password || !nome) {
        return { success: false, error: 'Tutti i campi sono obbligatori' };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Inserisci un indirizzo email valido' };
      }

      if (password.length < 6) {
        return { success: false, error: 'La password deve essere di almeno 6 caratteri' };
      }

      if (nome.trim().length < 2) {
        return { success: false, error: 'Il nome deve essere di almeno 2 caratteri' };
      }
      
      logger.debug('Attempting to sign up with:', { email: email.trim().toLowerCase(), nome, ruolo });
      
      // Check if user already exists
      const existingUser = await checkIfUserExists(email.trim().toLowerCase());
      if (existingUser) {
        return { success: false, error: 'Utente già registrato. Prova ad accedere.' };
      }
      
      // Create new user (simplified approach)
      const newUser: Utente = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ruolo,
        nome,
        email: email.trim().toLowerCase(),
        password,
        verificato: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Save user to local storage
      await saveRegularUser(newUser);
      
      // Persist user session
      await persistUserData(newUser);
      
      // Clear any existing onboarding flags for new users
      await AsyncStorage.removeItem('onboarding_completed');
      await AsyncStorage.removeItem('tenant_onboarding_completed');
      await AsyncStorage.removeItem('landlord_onboarding_completed');
      
      logger.debug('New user created and signed in:', newUser);
      
      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clear any stored role preference to use the user's actual role
      await AsyncStorage.removeItem('user_role_preference');
      logger.debug('🔍 Cleared stored role preference');
      
      // Validate input
      if (!email || !password) {
        return { success: false, error: 'Email e password sono obbligatori' };
      }

      if (!email.includes('@')) {
        return { success: false, error: 'Inserisci un indirizzo email valido' };
      }

      if (password.length < 6) {
        return { success: false, error: 'La password deve essere di almeno 6 caratteri' };
      }
      
      logger.debug('Attempting to sign in with:', { email: email.trim().toLowerCase() });
      
      // First, try to find user in our local storage
      const existingUser = await checkIfUserExists(email.trim().toLowerCase());
      logger.debug('Checking for existing user:', email.trim().toLowerCase());
      logger.debug('Found user:', existingUser);
      
      if (existingUser) {
        logger.debug('Found existing user in local storage:', existingUser);
        logger.debug('🔍 User role from storage:', existingUser.ruolo);
        logger.debug('🔍 User role type:', typeof existingUser.ruolo);
        logger.debug('🔍 User role === "tenant":', existingUser.ruolo === 'tenant');
        logger.debug('🔍 User role === "landlord":', existingUser.ruolo === 'landlord');
        
        // Use the user's actual role from storage, don't override with stored preference
        logger.debug('🔍 Using user role from storage:', existingUser.ruolo);

        if (existingUser.password && existingUser.password !== password) {
          setLoading(false);
          return { success: false, error: 'Password non corretta' };
        }

        const userWithPassword = existingUser.password
          ? existingUser
          : { ...existingUser, password };

        await persistUserData(userWithPassword);
        setLoading(false);
        return { success: true, user: userWithPassword };
      }
      
      // If not found locally, return error (user needs to sign up first)
      logger.debug('No existing user found, need to sign up first');
      return { success: false, error: 'Utente non trovato. Crea un account prima di accedere.' };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { success: false, error: 'Errore durante l\'accesso. Riprova.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all user data
      setUser(null);
      setSession(null);
      setIsAppleSignIn(false);
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('session');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('onboarding_completed');
      await AsyncStorage.removeItem('tenant_onboarding_completed');
      await AsyncStorage.removeItem('landlord_onboarding_completed');
      
      logger.debug('User logged out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      throw error; // Re-throw to handle in calling function
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      const currentUser = user;
      
      if (!currentUser) {
        return { success: false, error: 'Nessun utente trovato' };
      }

      logger.debug('🗑️ Deleting account for user:', currentUser.email);

      // Remove user from Supabase auth if they have a session
      // Note: Client-side deletion requires the user to be authenticated
      // For full deletion, this should be handled server-side
      if (session?.user) {
        try {
          // Try to delete the user - this may require server-side implementation
          // For now, we'll just sign them out which effectively removes their session
          await supabase.auth.signOut();
        } catch (error) {
          logger.debug('Error signing out during account deletion:', error);
        }
      }

      // Remove user from local storage lists
      try {
        // Remove from regular_users
        const regularUsers = await AsyncStorage.getItem('regular_users');
        if (regularUsers) {
          const users = JSON.parse(regularUsers);
          const filteredUsers = users.filter((u: any) => u.id !== currentUser.id && u.email !== currentUser.email);
          await AsyncStorage.setItem('regular_users', JSON.stringify(filteredUsers));
        }

        // Remove from apple_users
        const appleUsers = await AsyncStorage.getItem('apple_users');
        if (appleUsers) {
          const users = JSON.parse(appleUsers);
          const filteredUsers = users.filter((u: any) => u.id !== currentUser.id && u.email !== currentUser.email);
          await AsyncStorage.setItem('apple_users', JSON.stringify(filteredUsers));
        }
      } catch (error) {
        logger.debug('Error removing user from storage lists:', error);
      }

      // Clear all user data (same as signOut)
      setUser(null);
      setSession(null);
      setIsAppleSignIn(false);
      
      // Clear all AsyncStorage data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('session');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('onboarding_completed');
      await AsyncStorage.removeItem('tenant_onboarding_completed');
      await AsyncStorage.removeItem('landlord_onboarding_completed');
      await AsyncStorage.removeItem('user_role_preference');

      logger.debug('✅ Account deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message || 'Impossibile eliminare l\'account' };
    } finally {
      setLoading(false);
    }
  };

  async function updateUserInStorageList(key: string, updatedUser: Utente, previousEmail?: string) {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return;
      const users = JSON.parse(stored);
      const index = users.findIndex((u: any) => u.id === updatedUser.id || u.email === previousEmail || u.email === updatedUser.email);
      if (index >= 0) {
        users[index] = { ...users[index], ...updatedUser };
        await AsyncStorage.setItem(key, JSON.stringify(users));
      }
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  }

  async function persistUserData(updatedUser: Utente, previousEmail?: string) {
    setUser(updatedUser);
    await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
    await updateUserInStorageList('regular_users', updatedUser, previousEmail);
    await updateUserInStorageList('apple_users', updatedUser, previousEmail);
  }

  const updateProfile = async (updates: Partial<Utente>) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      // Try to update in database, but don't fail if table doesn't exist
      try {
        const { error } = await supabase
          .from('utenti')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
      } catch (dbError) {
        logger.debug('Could not update user profile in database, table may not exist');
      }

      // Update local state
      const updatedUser = user ? { ...user, ...updates } : null;
      
      if (updatedUser) {
        await persistUserData(updatedUser, user.email);
        logger.debug('✅ Profile updated and saved to storage:', updatedUser);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        return { success: false, error: 'Nessun utente collegato' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'La nuova password deve avere almeno 6 caratteri' };
      }

      const storedUser = await checkIfUserExists(user.email);
      if (storedUser?.password && storedUser.password !== currentPassword) {
        return { success: false, error: 'La password attuale non è corretta' };
      }

      const updatedUser = { ...user, password: newPassword };
      await persistUserData(updatedUser, user.email);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateEmailAddress = async (newEmail: string) => {
    try {
      if (!user) {
        return { success: false, error: 'Nessun utente collegato' };
      }

      const formattedEmail = newEmail.trim().toLowerCase();
      if (!formattedEmail || !formattedEmail.includes('@')) {
        return { success: false, error: 'Inserisci un indirizzo email valido' };
      }

      const existing = await checkIfUserExists(formattedEmail);
      if (existing && existing.id !== user.id) {
        return { success: false, error: 'Questa email è già registrata' };
      }

      const updatedUser = { ...user, email: formattedEmail };
      await persistUserData(updatedUser, user.email);
      return { success: true };
    } catch (error: any) {
      console.error('Update email error:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadProfilePhoto = async (photo: any) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      // Create a mock URL for the uploaded photo
      const photoUrl = `https://via.placeholder.com/300x300/2196F3/FFFFFF?text=${user.nome.charAt(0)}`;
      
      // Update user profile with new photo
      const updatedUser = { ...user, foto: photoUrl };
      setUser(updatedUser);
      
      // Save updated user to AsyncStorage for persistence
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      logger.debug('✅ Profile photo updated and saved to storage');

      // Try to update in database
      try {
        await supabase
          .from('utenti')
          .update({ foto: photoUrl })
          .eq('id', user.id);
      } catch (dbError) {
        logger.debug('Could not update photo in database, table may not exist');
      }

      return { success: true, url: photoUrl };
    } catch (error: any) {
      console.error('Upload photo error:', error);
      return { success: false, error: error.message };
    }
  };

  const switchRole = async (newRole: 'tenant' | 'landlord') => {
    try {
      logger.debug('🔄 switchRole called with newRole:', newRole);
      
      // Get current user from storage as fallback
      let currentUser = user;
      if (!currentUser) {
        try {
          const storedUser = await AsyncStorage.getItem('current_user');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
            logger.debug('🔄 Retrieved user from storage for role switch');
          }
        } catch (error) {
          logger.debug('Could not retrieve user from storage');
        }
      }
      
      if (!currentUser) {
        logger.debug('❌ No user logged in');
        return { success: false, error: 'No user logged in' };
      }

      logger.debug('🔄 Switching role from', currentUser.ruolo, 'to', newRole);

      // Check if this is the first time switching to this role
      const isFirstTimeSwitch = !currentUser[`${newRole}_onboarding_completed`];

      // Update local user state immediately
      const updatedUser = { 
        ...currentUser, 
        ruolo: newRole,
        userType: newRole === 'tenant' ? 'tenant' as const : 'homeowner' as const
      };
      
      // Set user state first
      setUser(updatedUser);
      
      // Wait for state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save updated user to storage for persistence
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      
      // Save role preference to AsyncStorage
      await AsyncStorage.setItem('user_role_preference', newRole);
      
      // Force a complete refresh by clearing any cached data
      await AsyncStorage.removeItem('user_role_preference');
      await AsyncStorage.setItem('user_role_preference', newRole);
      
      // Force multiple state updates to ensure propagation
      setTimeout(() => {
        setUser(updatedUser);
      }, 50);
      
      setTimeout(() => {
        setUser(updatedUser);
      }, 100);
      
      logger.debug('✅ Role switched successfully to:', newRole);

      // Try to update in database, but don't fail if table doesn't exist
      try {
        await supabase
          .from('utenti')
          .update({ ruolo: newRole })
          .eq('id', currentUser.id);
      } catch (dbError) {
        logger.debug('Could not update role in database, table may not exist');
      }

      return { 
        success: true, 
        user: updatedUser,
        needsOnboarding: isFirstTimeSwitch,
        newRole 
      };
    } catch (error: any) {
      console.error('❌ Switch role error:', error);
      return { success: false, error: error.message };
    }
  };

  const getStoredRolePreference = async (): Promise<'tenant' | 'landlord'> => {
    try {
      const storedRole = await AsyncStorage.getItem('user_role_preference');
      logger.debug('🔍 Stored role preference:', storedRole);
      return (storedRole as 'tenant' | 'landlord') || 'tenant';
    } catch (error) {
      console.error('Error getting stored role preference:', error);
      return 'tenant';
    }
  };

  const completeOnboarding = async (role: 'tenant' | 'landlord') => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      const onboardingKey = role === 'tenant' ? 'tenant_onboarding_completed' : 'landlord_onboarding_completed';
      const updatedUser = { ...user, [onboardingKey]: true };
      setUser(updatedUser);

      // Store in AsyncStorage
      await AsyncStorage.setItem(onboardingKey, 'true');
      await AsyncStorage.setItem('onboarding_completed', 'true');
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser));
      logger.debug('✅ Onboarding completed and user saved to storage');

      // Try to update in database, but don't fail if table doesn't exist
      try {
        await supabase
          .from('utenti')
          .update({ [onboardingKey]: true })
          .eq('id', user.id);
      } catch (dbError) {
        logger.debug('Could not update onboarding status in database, table may not exist');
      }

      logger.debug(`${role} onboarding completed`);
      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return { success: false, error: error.message };
    }
  };

  const checkExistingUsers = async () => {
    try {
      logger.debug('Checking existing users...');
      // Note: This requires admin privileges, so it might not work in client-side code
      // For now, we'll just log that we're checking
      logger.debug('Note: Checking users requires admin access');
      return [];
    } catch (error) {
      logger.debug('Error checking users:', error);
      return [];
    }
  };

  const signInWithApple = async (identityToken: string, user: any) => {
    try {
      setLoading(true);
      setIsAppleSignIn(true);
      logger.debug('Signing in with Apple:', { identityToken, user });
      
      // Check if user already exists in our system
      const existingUser = await checkIfUserExists(user.email || `${user.id}@privaterelay.appleid.com`);
      
      if (existingUser) {
        // User exists, sign them in
        logger.debug('Existing Apple user found:', existingUser);
        setUser(existingUser);
        // Save current user to storage for persistence
        await AsyncStorage.setItem('current_user', JSON.stringify(existingUser));
        setLoading(false);
        
        // Reset the Apple Sign In flag after a delay to ensure state is properly set
        setTimeout(() => {
          setIsAppleSignIn(false);
        }, 2000);
        
        return { success: true, user: existingUser, isNewUser: false };
      } else {
        // New user, create account and trigger onboarding
        logger.debug('New Apple user, creating account...');
        const newUser: Utente = {
          id: user.id,
          ruolo: 'tenant', // Default role
          nome: user.name || 'Apple User',
          email: user.email || `${user.id}@privaterelay.appleid.com`,
          verificato: true, // Apple users are considered verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Save the new user to AsyncStorage
        await saveAppleUser(newUser);
        
        // For new users, ensure onboarding is not marked as completed
        await AsyncStorage.removeItem('onboarding_completed');
        
        setUser(newUser);
        // Save current user to storage for persistence
        await AsyncStorage.setItem('current_user', JSON.stringify(newUser));
        logger.debug('Apple user created:', newUser);
        setLoading(false);
        
        // Reset the Apple Sign In flag after a delay to ensure state is properly set
        setTimeout(() => {
          setIsAppleSignIn(false);
        }, 2000);
        
        return { success: true, user: newUser, isNewUser: true };
      }
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      setLoading(false);
      setIsAppleSignIn(false); // Reset flag on error
      return { success: false, error: error.message };
    }
  };

  const checkIfUserExists = async (email: string) => {
    try {
      // Check both Apple users and regular users
      const appleUsers = await AsyncStorage.getItem('apple_users');
      const regularUsers = await AsyncStorage.getItem('regular_users');
      
      let allUsers = [];
      
      if (appleUsers) {
        allUsers = [...allUsers, ...JSON.parse(appleUsers)];
      }
      
      if (regularUsers) {
        allUsers = [...allUsers, ...JSON.parse(regularUsers)];
      }
      
      return allUsers.find((u: any) => u.email === email);
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return null;
    }
  };

  const saveAppleUser = async (user: Utente) => {
    try {
      const existingUsers = await AsyncStorage.getItem('apple_users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists and update, otherwise add new
      const existingIndex = users.findIndex((u: any) => u.email === user.email);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      await AsyncStorage.setItem('apple_users', JSON.stringify(users));
      logger.debug('Apple user saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving Apple user:', error);
    }
  };

  const saveRegularUser = async (user: Utente) => {
    try {
      const existingUsers = await AsyncStorage.getItem('regular_users');
      let users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists and update, otherwise add new
      const existingIndex = users.findIndex((u: any) => u.email === user.email);
      if (existingIndex >= 0) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      await AsyncStorage.setItem('regular_users', JSON.stringify(users));
      logger.debug('Regular user saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving regular user:', error);
    }
  };

  const loadCurrentUserFromStorage = async () => {
    try {
      logger.debug('🔄 Loading current user from storage...');
      const currentUser = await AsyncStorage.getItem('current_user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        logger.debug('🔄 Found user in storage:', userData);
        logger.debug('🔄 User userType from storage:', userData.userType);
        logger.debug('🔄 User ruolo from storage:', userData.ruolo);
        logger.debug('🔄 Final role (userType || ruolo):', userData.userType || userData.ruolo);
        logger.debug('🔄 User name from storage:', userData.name || userData.nome);
        
        // ALWAYS ensure both fields are set
        let needsUpdate = false;
        
        // Fix the role if userType exists but ruolo doesn't
        if (userData.userType && !userData.ruolo) {
          logger.debug('🔧 Fixing stored user role - adding ruolo field');
          userData.ruolo = userData.userType;
          needsUpdate = true;
        }
        
        // Also ensure userType is set if only ruolo exists
        if (userData.ruolo && !userData.userType) {
          logger.debug('🔧 Fixing stored user type - adding userType field');
          userData.userType = userData.ruolo === 'landlord' ? 'homeowner' : userData.ruolo;
          needsUpdate = true;
        }
        
        // If neither field exists, set both to tenant
        if (!userData.userType && !userData.ruolo) {
          logger.debug('🔧 No role fields found - setting both to tenant');
          userData.userType = 'tenant';
          userData.ruolo = 'tenant';
          needsUpdate = true;
        }
        
        // Save the fixed user back to storage if needed
        if (needsUpdate) {
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
          logger.debug('🔧 User data updated and saved to storage');
        }
        
        setUser(userData);
        setLoading(false);
        return userData; // Return the user data
      } else {
        logger.debug('🔄 No user found in storage');
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setLoading(false);
      return null;
    }
  };

  const reloadUserFromStorage = async () => {
    return await loadCurrentUserFromStorage();
  };

  const addTestUsers = async () => {
    try {
      // Check if test users already exist
      const existingUsers = await AsyncStorage.getItem('regular_users');
      if (existingUsers) {
        const users = JSON.parse(existingUsers);
        if (users.length > 0) {
          logger.debug('Test users already exist, skipping...');
          return;
        }
      }

      // Create test users
      const testUsers: Utente[] = [
        {
          id: 'test_user_1',
          ruolo: 'tenant',
          nome: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          verificato: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'test_user_2',
          ruolo: 'landlord',
          nome: 'Test Landlord',
          email: 'landlord@example.com',
          password: 'password123',
          verificato: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      await AsyncStorage.setItem('regular_users', JSON.stringify(testUsers));
      logger.debug('Test users created successfully');
    } catch (error) {
      console.error('Error creating test users:', error);
    }
  };

  // const signInWithGoogle = async (user: any) => {
  //   try {
  //     setLoading(true);
  //     logger.debug('Signing in with Google:', user);
      
  //     // For now, we'll create a mock user since Supabase Google auth requires backend configuration
  //     const mockUser: Utente = {
  //       id: user.id,
  //       ruolo: 'tenant', // Default role
  //       nome: user.name || 'Google User',
  //       email: user.email || `${user.id}@gmail.com`,
  //       verificato: true, // Google users are considered verified
  //       created_at: new Date().toISOString(),
  //       updated_at: new Date().toISOString(),
  //     };
      
  //     setUser(mockUser);
  //     logger.debug('Google user created:', mockUser);
      
  //     return { success: true, user: mockUser };
  //   } catch (error: any) {
  //     console.error('Google sign in error:', error);
  //     return { success: false, error: error.message };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    deleteAccount,
    updateProfile,
    uploadProfilePhoto,
    changePassword,
    updateEmail: updateEmailAddress,
    switchRole,
    completeOnboarding,
    getStoredRolePreference,
    checkExistingUsers,
    signInWithApple,
    reloadUserFromStorage,
  };
};

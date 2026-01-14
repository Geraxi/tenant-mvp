import { supabase } from '../client/supabase';
import { Alert } from 'react-native';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  verified: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email and password
export async function signUpWithEmail({ email, password, full_name }: SignUpData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Create HomeGoal wallet
      const { error: walletError } = await supabase
        .from('homegoal_wallet')
        .insert({
          user_id: data.user.id,
          goal_amount: 0,
          cashback_balance: 0,
          manual_deposits: 0,
          bonuses: 0,
        });

      if (walletError) {
        console.error('Error creating wallet:', walletError);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: full_name,
          verified: false,
        },
      };
    }

    return { success: false, error: 'Errore durante la registrazione' };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Errore di connessione' };
  }
}

// Sign in with email and password
export async function signInWithEmail({ email, password }: SignInData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          verified: profile?.verified || false,
        },
      };
    }

    return { success: false, error: 'Errore durante l\'accesso' };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Errore di connessione' };
  }
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Errore durante il logout' };
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email!,
      name: profile?.full_name,
      avatar_url: profile?.avatar_url,
      verified: profile?.verified || false,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Update user profile
export async function updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Utente non autenticato' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Errore durante l\'aggiornamento' };
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

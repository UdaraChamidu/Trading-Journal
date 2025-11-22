import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

// Theme context for managing dark/light mode
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setThemeFromProfile: (darkMode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setThemeFromProfile = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setThemeFromProfile }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface AuthContextType {
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // 1. Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          if (initialSession) {
            await fetchUserProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        // 2. Ensure loading is set to false ONLY after initial check is done
        if (mounted) {
          setLoading(false);
        }
      }

      // 3. Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession) {
            // Only fetch profile if we don't have it or if the user changed
            // This prevents double-fetching on refresh
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
               await fetchUserProfile(currentSession.user.id);
            }
          } else {
            setUserProfile(null);
          }
          
          // Ensure loading is false after any auth change
          setLoading(false); 
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return; // Don't throw, just return
      }

      if (!data) {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('users_profile')
          .insert([{ id: userId }])
          .select()
          .single();
          
        if (insertError) {
           console.error("Error creating profile:", insertError);
        } else {
           setUserProfile(newProfile);
        }
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error in fetchUserProfile:", err);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session) return { error: 'No session' };

    const { error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('id', session.user.id);

    if (!error) {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, userProfile, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
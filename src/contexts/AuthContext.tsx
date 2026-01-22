import React, { createContext, useContext, useEffect, useState } from 'react';
import { googleLogout } from '@react-oauth/google';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'email' | 'google' | 'github';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogleCredential: (credential: string) => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mock_auth_user';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Decode JWT token to get user info
const decodeJwt = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistUser = (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await delay(800); // Simulate network request

    // Mock validation - accept any email/password with basic validation
    if (!email.includes('@')) {
      return { error: new Error('Invalid email address') };
    }
    if (password.length < 6) {
      return { error: new Error('Password must be at least 6 characters') };
    }

    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      provider: 'email'
    };

    persistUser(mockUser);
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await delay(800);

    if (!email.includes('@')) {
      return { error: new Error('Invalid email address') };
    }
    if (password.length < 6) {
      return { error: new Error('Password must be at least 6 characters') };
    }

    const mockUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      provider: 'email'
    };

    persistUser(mockUser);
    return { error: null };
  };

  const signInWithGoogleCredential = async (credential: string) => {
    try {
      const decoded = decodeJwt(credential);

      if (!decoded) {
        return { error: new Error('Failed to decode Google credential') };
      }

      const googleUser: User = {
        id: decoded.sub as string,
        email: decoded.email as string,
        name: decoded.name as string,
        picture: decoded.picture as string,
        provider: 'google'
      };

      persistUser(googleUser);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Google sign-in failed') };
    }
  };

  const signInWithGitHub = async () => {
    await delay(1200); // Simulate OAuth flow (still mocked)

    const mockUser: User = {
      id: `github_${Date.now()}`,
      email: 'user@github.com',
      name: 'GitHub User',
      provider: 'github'
    };

    persistUser(mockUser);
    return { error: null };
  };

  const signOut = async () => {
    // If user was signed in with Google, also logout from Google
    if (user?.provider === 'google') {
      googleLogout();
    }
    await delay(300);
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogleCredential,
      signInWithGitHub,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

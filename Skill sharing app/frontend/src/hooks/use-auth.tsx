'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { authAPI, initializeCsrfToken } from '@/lib/api';

// Define the shape of the user object
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'learner' | 'teacher' | 'both';
  bio?: string;
  avatar_url?: string;
  rating?: number;
  total_reviews?: number;
  email_verified_at?: string;
  created_at?: string;
}

// API Response types
interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    token?: string;
    unverified?: boolean;
    pending?: boolean;
  } & Record<string, any>;
  errors?: Record<string, string[]>;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  isPending: boolean; // For teachers pending verification
  register: (name: string, email: string, password: string, role: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize CSRF token first
        await initializeCsrfToken();
        
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Try to fetch current user profile
          const response = await authAPI.profile() as AuthResponse;
          if (response.success && response.data) {
            setUser(response.data as User);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {
      try {
        setLoading(true);
        const response = await authAPI.register(name, email, password, role) as AuthResponse;
        
        if (!response.success) {
          return response;
        }

        return {
          success: true,
          message: 'Registration successful! Please check your email to verify your account.',
          data: response.data,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password) as AuthResponse;

      if (response.success && response.data?.user) {
        setUser(response.data.user as User);
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await authAPI.profile() as AuthResponse;
      if (response.success && response.data) {
        setUser(response.data as User);
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  }, []);

  const isAuthenticated = !!user;
  const isVerified = !!user?.email_verified_at;
  const isPending = user?.role !== 'learner' && !isVerified; // Teachers are pending if not verified

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    isVerified,
    isPending,
    register,
    login,
    logout,
    refreshUser,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

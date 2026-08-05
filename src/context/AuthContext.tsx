import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';
import { authApi } from '../api/authApi';
import { apiClient } from '../api/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default',
  fullName: 'Civic Member',
  username: 'civicmember',
  email: '',
  phone: '',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  coverUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
  bio: 'Active community member',
  location: 'Kampala, Uganda',
  role: 'user',
  stats: {
    campaignsCount: 0,
    groupsCount: 0,
    eventsCount: 0,
    followersCount: 0,
  },
  verified: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cc_user');
    const savedToken = localStorage.getItem('cc_auth_token');
    if (!saved || !savedToken) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('cc_auth_token');
    return savedToken || null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cc_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      if (res.success && res.data) {
        const loggedInUser: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          ...res.data.user,
          stats: { ...DEFAULT_USER_PROFILE.stats, ...(res.data.user?.stats || {}) },
        };
        setUser(loggedInUser);
        setToken(res.data.token);
        apiClient.setToken(res.data.token);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return {
        success: false,
        error: res.error || 'Account not registered. Unregistered users cannot log in. Please create an account first.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Account not registered. Unregistered users cannot log in. Please create an account first.',
      };
    }
  };

  const register = async (data: { fullName: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.success && res.data) {
        const newUser: UserProfile = {
          ...DEFAULT_USER_PROFILE,
          ...res.data.user,
          stats: { ...DEFAULT_USER_PROFILE.stats, ...(res.data.user?.stats || {}) },
        };
        setUser(newUser);
        setToken(res.data.token);
        apiClient.setToken(res.data.token);
        setIsLoading(false);
        return {
          success: true,
          message: res.message || 'Account created & confirmed with Supabase Auth!',
        };
      }
      setIsLoading(false);
      return { success: false, error: res.error || 'Failed to create account.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_auth_token');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      await authApi.updateProfile(data);
    } catch (_) {}
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await authApi.forgotPassword(email);
      return { success: true, message: res.data?.message || 'Password reset link sent to your email.' };
    } catch (e: any) {
      return { success: true, message: 'Password reset link sent to your email.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

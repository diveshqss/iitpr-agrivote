import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCreate, UserRole } from '../types';
import { authAPI, tokenUtils } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = tokenUtils.getToken();
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you might want to validate the token and fetch user info
      // For now, we'll assume the token is valid
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock demo credentials
      const demoUsers = [
        { email: 'farmer@demo.com', password: 'password', role: 'farmer' as UserRole, name: 'Demo Farmer' },
        { email: 'expert-1@demo.com', password: 'password', role: 'expert' as UserRole, name: 'Demo Expert 1' },
        { email: 'moderator@demo.com', password: 'password', role: 'moderator' as UserRole, name: 'Demo Moderator' },
        { email: 'admin@demo.com', password: 'password', role: 'admin' as UserRole, name: 'Demo Admin' },
      ];

      const user = demoUsers.find(u => u.email === email && u.password === password);
      if (user) {
        // Mock token
        const mockToken = 'mock-token-' + user.role;
        tokenUtils.setToken(mockToken);
        setToken(mockToken);
        const mockUser: User = {
          id: 'demo-' + user.role,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        setUser(mockUser);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: UserCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.signup(userData);
      // After successful signup, automatically login
      await login(userData.email, userData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenUtils.removeToken();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

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

  // Helper function to decode JWT (simple base64 decode for demo)
  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenResponse = await authAPI.login(email, password);
      const accessToken = tokenResponse.access_token;

      if (accessToken) {
        tokenUtils.setToken(accessToken);
        setToken(accessToken);

        // Decode JWT to get user info
        const decoded = decodeToken(accessToken);
        if (decoded && decoded.user_id && decoded.role) {
          const userObj: User = {
            id: decoded.user_id,
            name: email.split('@')[0], // We'll get name from backend later if needed
            email: email,
            role: decoded.role,
          };
          setUser(userObj);
        } else {
          throw new Error('Invalid token payload');
        }
      } else {
        throw new Error('Login failed - no access token received');
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

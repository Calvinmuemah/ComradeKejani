import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '../types';
import { API_ENDPOINTS, storeAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Remove mockUsers. Use real API.

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('kejani_admin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('kejani_admin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('[API REQUEST]', API_ENDPOINTS.login, { email });
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      let data;
      try {
        data = await response.clone().json();
      } catch {
        data = null;
      }
      console.log('[API RESPONSE]', API_ENDPOINTS.login, {
        status: response.status,
        ok: response.ok,
        data,
      });
      if (!response.ok) {
        throw new Error((data && data.message) || 'Invalid credentials');
      }
      if (!data.token) {
        throw new Error('No token returned from server');
      }
      storeAuthToken(data.token);
      setUser({
        id: '',
        email,
        name: '',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: Object.values(Permission),
      });
      localStorage.setItem('kejani_admin_user', JSON.stringify({
        id: '',
        email,
        name: '',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: Object.values(Permission),
      }));
    } catch (error: any) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kejani_admin_user');
  };

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
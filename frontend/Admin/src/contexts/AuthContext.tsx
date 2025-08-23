import React, { useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '../types';
import { API_ENDPOINTS, storeAuthToken, clearAuthSession } from '../lib/api';
import { AuthContext, AuthContextType } from './AuthContextStore';

// Remove mockUsers. Use real API.

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to check for existing session
    const checkSession = async () => {
      setIsLoading(true);
      const savedUser = sessionStorage.getItem('kejani_admin_user');
      const token = sessionStorage.getItem('authToken');
      
      if (savedUser && token) {
        try {
          // Parse the saved user
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch {
          // If there's an error parsing the user data, clear the session
          clearAuthSession();
        }
      }
      setIsLoading(false);
    };
    
    checkSession();
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
      sessionStorage.setItem('kejani_admin_user', JSON.stringify({
        id: '',
        email,
        name: '',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date().toISOString(),
        permissions: Object.values(Permission),
      }));
    } catch (error: unknown) {
      setIsLoading(false);
      throw error;
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
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
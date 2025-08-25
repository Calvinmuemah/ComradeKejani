import React, { useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '../types';
import { API_ENDPOINTS, storeAuthToken, clearAuthSession, fetchAdminProfile } from '../lib/api';
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
      if (!data || !data.token || !data._id) {
        throw new Error('Incomplete login response');
      }
      storeAuthToken(data.token);
      const mapped: User = {
        id: data._id,
        email: data.email,
        name: data.name || '',
        phone: data.phone,
        avatar: data.avatar || null,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        createdAt: data.createdAt || new Date().toISOString(),
        permissions: Object.values(Permission)
      };
      setUser(mapped);
      sessionStorage.setItem('kejani_admin_user', JSON.stringify(mapped));
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

  const refreshProfile = async () => {
    if(!user?.id) return;
    try {
      const profile = await fetchAdminProfile(user.id);
      const updated: User = {
        id: profile._id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar || null,
        role: user.role,
        isActive: user.isActive,
        createdAt: profile.createdAt,
        permissions: user.permissions
      };
      setUser(updated);
      sessionStorage.setItem('kejani_admin_user', JSON.stringify(updated));
    } catch {
      // ignore fetch errors silently or log
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
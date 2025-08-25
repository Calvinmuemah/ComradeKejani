import { createContext } from 'react';
import { User, UserRole, Permission } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshProfile?: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { MODULE_PERMISSIONS } from '@/constants';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@construction.com',
    role: 'admin',
    avatar: undefined
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@construction.com',
    role: 'manager',
    avatar: undefined
  },
  {
    id: '3',
    name: 'Mike Supervisor',
    email: 'supervisor@construction.com',
    role: 'site_supervisor',
    avatar: undefined
  },
  {
    id: '4',
    name: 'Alex Employee',
    email: 'employee@construction.com',
    role: 'employee',
    avatar: undefined
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('construction_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('construction_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email (password validation would be done on server)
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (foundUser && password === 'password') { // Mock password validation
      setUser(foundUser);
      localStorage.setItem('construction_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('construction_user');
  };

  const hasPermission = (module: string): boolean => {
    if (!user) return false;
    const permissions = MODULE_PERMISSIONS[user.role];
    return permissions.includes(module);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    hasRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

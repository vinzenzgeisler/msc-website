import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - replace with real auth later
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@msc-dreilaendereck.de': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@msc-dreilaendereck.de',
      name: 'Administrator',
      role: 'admin',
    },
  },
  'redaktion@msc-dreilaendereck.de': {
    password: 'editor123',
    user: {
      id: '2',
      email: 'redaktion@msc-dreilaendereck.de',
      name: 'Redakteur',
      role: 'editor',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('msc_admin_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email.toLowerCase()];
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('msc_admin_user', JSON.stringify(mockUser.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('msc_admin_user');
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
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

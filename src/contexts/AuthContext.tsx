import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ensureCmsSession, pb, UserRole, mapProfileRecord } from '@/integrations/pocketbase/client';

export type { UserRole };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { token: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncFromStore = () => {
    const record = pb.authStore.record;
    const token = pb.authStore.token;

    setSession(token ? { token } : null);

    if (record) {
      const profile = mapProfileRecord(record);
      setUser({
        id: profile.user_id,
        email: profile.email,
        name: profile.full_name || profile.email,
        role: profile.role,
      });
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = pb.authStore.onChange(() => {
      syncFromStore();
    }, true);

    const validateSession = async () => {
      if (!pb.authStore.token || !pb.authStore.record) {
        syncFromStore();
        return;
      }

      try {
        await ensureCmsSession();
      } catch {
        if (!cancelled) {
          pb.authStore.clear();
        }
      } finally {
        if (!cancelled) {
          syncFromStore();
        }
      }
    };

    validateSession();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const authData = await pb.collection('cms_users').authWithPassword(email, password);
      const profile = mapProfileRecord(authData.record);

      if (profile.role !== 'super_admin' && profile.role !== 'admin' && profile.role !== 'editor') {
        pb.authStore.clear();
        return { success: false, error: 'Keine Berechtigung für den Admin-Bereich' };
      }

      if (!profile.is_active) {
        pb.authStore.clear();
        return { success: false, error: 'Benutzer ist deaktiviert' };
      }

      syncFromStore();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    setUser(null);
    setSession(null);
  };

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading,
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

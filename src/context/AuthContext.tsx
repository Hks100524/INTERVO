'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { AuthUser } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  logout: () => Promise<boolean>;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

async function fetchAuthUser() {
  const response =
    await fetch(
      '/api/auth/profile',
      {
        cache: 'no-store',
        credentials: 'include',
      }
    );

  const data =
    (await response
      .json()
      .catch(() => null)) as
      | {
          success?: boolean;
          user?: AuthUser;
        }
      | null;

  if (
    !response.ok ||
    !data?.success ||
    !data.user
  ) {
    return null;
  }

  return data.user;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);
  const [loading, setLoading] =
    useState(true);

  const refreshUser =
    useCallback(async () => {
      setLoading(true);

      try {
        const currentUser =
          await fetchAuthUser();

        setUser(currentUser);

        return currentUser;
      } catch (error) {
        console.error(
          'Failed to refresh auth user:',
          error
        );

        setUser(null);
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  const logout =
    useCallback(async () => {
      setLoading(true);

      try {
        const response =
          await fetch(
            '/api/auth/logout',
            {
              method: 'POST',
              credentials: 'include',
            }
          );

        if (!response.ok) {
          return false;
        }

        setUser(null);
        return true;
      } catch (error) {
        console.error(
          'Failed to logout:',
          error
        );

        return false;
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const isAuthenticated =
    user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}

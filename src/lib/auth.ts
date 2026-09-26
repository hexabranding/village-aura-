import { useEffect, useState } from 'react';

export interface AuthUser {
  name: string;
  email: string;
  phone?: string;
  [key: string]: unknown;
}

export const USER_KEY = 'reshamUser';
export const TOKEN_KEY = 'reshamCustomerToken';
export const AUTH_EVENT = 'va:auth-change';

export interface AuthChangeDetail {
  type: 'login' | 'logout' | 'update';
  user: AuthUser | null;
  message?: string;
}

export const readUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const emit = (detail: AuthChangeDetail) => {
  window.dispatchEvent(new CustomEvent<AuthChangeDetail>(AUTH_EVENT, { detail }));
};

export const writeUser = (
  user: AuthUser,
  type: AuthChangeDetail['type'] = 'update',
  message?: string
) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emit({ type, user, message });
};

export const clearUser = (message?: string) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  emit({ type: 'logout', user: null, message });
};

export const useAuthUser = (): AuthUser | null => {
  const [user, setUser] = useState<AuthUser | null>(readUser);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<AuthChangeDetail>).detail;
      setUser(detail ? detail.user : readUser());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY) setUser(readUser());
    };
    window.addEventListener(AUTH_EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(AUTH_EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return user;
};

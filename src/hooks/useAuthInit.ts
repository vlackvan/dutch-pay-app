import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { usersApi } from '@/lib/api';

export function useAuthInit() {
  const [isLoading, setIsLoading] = useState(true);
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await usersApi.getMe();
        setUser(user);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [token, setUser, logout]);

  return { isLoading };
}

export default useAuthInit;

import { useCallback, useEffect, useState } from 'react';
import { login as apiLogin, getMe } from '../api/auth.js';

const TOKEN_KEY = 'sf_token';

export default function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { token, user: me } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return { user, isAuthed: Boolean(user), loading, login, logout };
}

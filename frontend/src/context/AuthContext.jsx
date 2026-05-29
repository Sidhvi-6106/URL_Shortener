import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api/axios";
import { createShortUrl } from "../api/urlApi";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mergeGuestUrls = useCallback(async () => {
    const guestUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");

    if (!Array.isArray(guestUrls) || guestUrls.length === 0) {
      return;
    }

    try {
      for (const guestUrl of guestUrls) {
        await createShortUrl(guestUrl);
      }
    } catch (error) {
      console.error("Guest URL merge failed:", error?.message || error);
    } finally {
      localStorage.removeItem("guest_urls");
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      if (res.data.user) {
        mergeGuestUrls();
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [mergeGuestUrls]);

  const loginSuccess = useCallback(
    async (userData) => {
      setUser(userData);
      await mergeGuestUrls();
    },
    [mergeGuestUrls]
  );

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const res = await api.get("/auth/me");

        if (mounted) {
          setUser(res.data.user);
        }

        if (res.data.user) {
          await mergeGuestUrls();
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [mergeGuestUrls]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loginSuccess,
      loading,
      checkAuth,
      logout,
    }),
    [user, loading, checkAuth, logout, loginSuccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

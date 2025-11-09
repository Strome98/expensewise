import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [preferences, setPreferences] = useState({
    alertOnNegativeNet: true,
    currency: "HUF",
  });
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("User");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
  api.interceptors.request.use((cfg) => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  async function loadProfile() {
    if (!token) return;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await api.get("/profile");
      setPreferences(
        res.data.preferences || { alertOnNegativeNet: true, currency: "HUF" }
      );
  setDisplayName(res.data.displayName || "");
  if (res.data.role) setRole(res.data.role);
    } catch (e) {
      setProfileError("Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  }

  async function updatePreferences(partial) {
    try {
      const res = await api.patch("/profile/preferences", partial);
      if (res.data.preferences) setPreferences(res.data.preferences);
      if (typeof res.data.displayName === "string")
        setDisplayName(res.data.displayName);
    } catch (e) {
      throw new Error("Failed to update preferences");
    }
  }

  function login(t, r) {
    setToken(t);
    localStorage.setItem("token", t);
    if (r) setRole(r);
  }
  function logout() {
    setToken(null);
    localStorage.removeItem("token");
    setPreferences({ alertOnNegativeNet: true, currency: "HUF" });
    setDisplayName("");
    setRole("User");
  }

  useEffect(() => {
    loadProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        preferences,
        displayName,
  role,
        updatePreferences,
        profileLoading,
        profileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

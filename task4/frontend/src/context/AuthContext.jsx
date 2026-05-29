import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile if JWT exists
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      console.error("[Auth Context] Load Profile failed:", err.message);
      // Clear corrupt values
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        settings: data.settings
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const data = await api.register(username, email, password);
      localStorage.setItem("token", data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        settings: data.settings
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUserSettings = async (settingsData) => {
    try {
      const response = await api.updateSettings(settingsData);
      setUser(prev => ({
        ...prev,
        settings: response.settings
      }));
      return response;
    } catch (error) {
      console.error("[Auth Context] Settings Update failed:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserSettings, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

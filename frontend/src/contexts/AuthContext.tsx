import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


const BASE_URL = import.meta.env.VITE_BASE_URL;
const AuthContext = createContext<any | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if token is expired and refresh if needed
  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (err) {
      return true;
    }
  };

  // Refresh token function
  const refreshAccessToken = async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await axios.post(`${BASE_URL}/users/token/refresh/`, { refresh: refreshToken });
      const newToken = response.data.access;
      
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      return true;
    } catch (err) {
      logout();
      return false;
    }
  };

  // On app load, check token and user info
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      if (token && !isTokenExpired()) {
        try {
          const response = await axios.get(`${BASE_URL}/users/profile/`);
          setCurrentUser(response.data);
        } catch (err) {
          setError(err.response?.data || { message: 'Error fetching user profile' });
          logout();
        }
      } else if (token && isTokenExpired()) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          try {
            const response = await axios.get(`${BASE_URL}/users/profile/`);
            setCurrentUser(response.data);
          } catch (err) {
            setError(err.response?.data || { message: 'Error fetching user profile' });
            logout();
          }
        }
      } else {
        logout();
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Login function
  const login = async (email:string, password:string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${BASE_URL}/users/token/`, { email, password });
      const { access, refresh, user } = response.data;
      
      // Set tokens in localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Update state
      setToken(access);
      setRefreshToken(refresh);
      setCurrentUser(user);
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Login failed' });
      setLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (userData:any) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(userData)
      const response = await axios.post(`${BASE_URL}/users/register/`, userData);
      const { access, refresh, user } = response.data;
      
      // Set tokens in localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Update state
      setToken(access);
      setRefreshToken(refresh);
      setCurrentUser(user);
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Registration failed' });
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData:any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${BASE_URL}/users/profile/`, profileData);
      setCurrentUser(response.data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data || { message: 'Failed to update profile' });
      setLoading(false);
      return false;
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
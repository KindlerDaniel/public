import React, { createContext, useState, useEffect, useCallback } from 'react';
import authAPI from '../utils/authAPI';
import jwtDecode from 'jwt-decode'; // Import jwt-decode

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  // Zwei separate Dialog-States
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // First define logout since it's used by other functions
  const logout = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error('Logout failed');
      }
      
      // Only clear state after successful backend logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return true; // Indicate successful logout
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear state but indicate failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return false;
    }
  }, [isAuthenticated, token, refreshToken]);

  const verifyTokensOnMount = useCallback(async () => {
    if (!token && !refreshToken) return;
    
    try {
      // First try with current access token
      const userData = await authAPI.fetchCurrentUser(token);
      setUser(userData.user);
      setIsAuthenticated(true);
    } catch (err) {
      // If access token fails, try refresh
      if (refreshToken) {
        try {
          const { accessToken, refreshToken: newRefreshToken } = await authAPI.refreshTokenRequest(refreshToken);
          
          // Update tokens in state and storage
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          setToken(accessToken);
          setRefreshToken(newRefreshToken);
          
          // Get user data with new token
          const userData = await authAPI.fetchCurrentUser(accessToken);
          setUser(userData.user);
          setIsAuthenticated(true);
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr);
          logout();
        }
      } else {
        logout();
      }
    }
  }, [token, refreshToken, logout]);

  useEffect(() => {
    verifyTokensOnMount();
  }, [verifyTokensOnMount]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      authAPI
        .fetchCurrentUser(token)
        .then(data => {
          setUser(data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !refreshToken) return;
    
    const checkAndRefreshToken = async () => {
      try {
        const decoded = jwtDecode(token);
        if (!decoded?.exp) return;
        
        // Refresh if token expires in less than 1 minute
        const expiresIn = (decoded.exp * 1000) - Date.now();
        if (expiresIn < 60000) {
          const { accessToken, refreshToken: newRefreshToken } = await authAPI.refreshTokenRequest(refreshToken);
          
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          setToken(accessToken);
          setRefreshToken(newRefreshToken);
        }
      } catch (err) {
        console.error('Token refresh check failed:', err);
      }
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkAndRefreshToken, 30000);
    return () => clearInterval(interval);
  }, [token, refreshToken]);

  const login = useCallback(async (username, password) => {
    try {
      const { token: newToken, refreshToken: newRefreshToken, user: newUser } = await authAPI.loginRequest(username, password);
      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(newUser);
      setIsAuthenticated(true);
      setShowLoginDialog(false);
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (username, password) => {
    try {
      const { token: newToken, user: newUser } = await authAPI.registerRequest(username, password);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      setShowRegisterDialog(false);
    } catch (err) {
      throw err;
    }
  }, []);

  // Login-Dialog Funktionen
  const openLoginDialog = useCallback(() => {
    if (isAuthenticated) return;
    setShowLoginDialog(true);
    setShowRegisterDialog(false); // Anderen Dialog schließen
  }, [isAuthenticated]);

  const closeLoginDialog = useCallback(() => {
    setShowLoginDialog(false);
  }, []);

  // Register-Dialog Funktionen  
  const openRegisterDialog = useCallback(() => {
    if (isAuthenticated) return;
    setShowRegisterDialog(true);
    setShowLoginDialog(false); // Anderen Dialog schließen
  }, [isAuthenticated]);

  const closeRegisterDialog = useCallback(() => {
    setShowRegisterDialog(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        refreshToken,
        login,
        register,
        logout,
        
        // Login Dialog
        showLoginDialog,
        openLoginDialog,
        closeLoginDialog,
        
        // Register Dialog
        showRegisterDialog,
        openRegisterDialog,
        closeRegisterDialog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
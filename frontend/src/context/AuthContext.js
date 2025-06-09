import React, { createContext, useState, useEffect } from 'react';
import authAPI from '../utils/authAPI';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  // Zwei separate Dialog-States
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

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
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        });
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const { token: newToken, user: newUser } = await authAPI.loginRequest(email, password);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      setShowLoginDialog(false);
    } catch (err) {
      throw err;
    }
  };

  const register = async (email, password) => {
    try {
      const { token: newToken, user: newUser } = await authAPI.registerRequest(email, password);
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      setShowRegisterDialog(false);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    if (!isAuthenticated) return;
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Login-Dialog Funktionen
  const openLoginDialog = () => {
    if (isAuthenticated) return;
    setShowLoginDialog(true);
    setShowRegisterDialog(false); // Anderen Dialog schließen
  };

  const closeLoginDialog = () => {
    setShowLoginDialog(false);
  };

  // Register-Dialog Funktionen  
  const openRegisterDialog = () => {
    if (isAuthenticated) return;
    setShowRegisterDialog(true);
    setShowLoginDialog(false); // Anderen Dialog schließen
  };

  const closeRegisterDialog = () => {
    setShowRegisterDialog(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
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
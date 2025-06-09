import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthButtons.css';

export default function AuthButtons() {
  const { isAuthenticated, user, openLoginDialog, logout } = useContext(AuthContext);

  const handleLogin = () => {
    if (isAuthenticated) return;
    openLoginDialog();
  };

  const handleLogout = () => {
    if (!isAuthenticated) return;
    logout();
  };

  return (
    <div className="auth-buttons">
      {/* Benutzer-Status anzeigen */}
      <div className="user-status">
        {isAuthenticated && user ? (
          <span className="logged-in-user">
            Eingeloggt als: <strong>{user.email}</strong>
          </span>
        ) : (
          <span className="not-logged-in">Nobody logged in</span>
        )}
      </div>

      {/* Auth-Buttons */}
      <div className="auth-actions">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="logout-button">
            Ausloggen
          </button>
        ) : (
          <button onClick={handleLogin} className="login-button">
            Anmelden
          </button>
        )}
      </div>
    </div>
  );
}
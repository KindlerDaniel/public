import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthButtons.css';

export default function AuthButtons() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

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

      {/* Logout Button */}
      {isAuthenticated && (
        <button onClick={handleLogout} className="logout-button">
          Ausloggen
        </button>
      )}
    </div>
  );
}
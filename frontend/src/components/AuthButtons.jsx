import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AuthButtons() {
  const { isAuthenticated, openLoginDialog, logout } = useContext(AuthContext);

  const handleLogin = () => {
    if (isAuthenticated) return;
    openLoginDialog();
  };

  const handleLogout = () => {
    if (!isAuthenticated) return;
    logout();
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

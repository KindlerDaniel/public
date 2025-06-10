import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginDialog() {
  const {
    showLoginDialog,
    closeLoginDialog,
    login,
    isAuthenticated
  } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showLoginDialog || isAuthenticated) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Bitte füllen Sie alle Felder aus');
      setIsLoading(false);
      return;
    }

    try {
      await login(username, password);
      // Dialog wird automatisch geschlossen durch AuthContext
    } catch (err) {
      setError(err.message || 'Fehler beim Login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeLoginDialog();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          minWidth: '360px',
          maxWidth: '400px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center', color: '#007bff' }}>
          Anmelden
        </h2>
        
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Benutzername:
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Ihr Benutzername"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Passwort:
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Ihr Passwort"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>

        <button
          onClick={closeLoginDialog}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '8px',
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
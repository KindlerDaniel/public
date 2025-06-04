import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginDialog() {
  const {
    showLoginDialog,
    closeLoginDialog,
    login,
    register,
    isAuthenticated
  } = useContext(AuthContext);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  if (!showLoginDialog || isAuthenticated) return null;

  const toggleMode = () => {
    setIsRegisterMode(prev => !prev);
    setError('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (isRegisterMode && password !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    try {
      if (isRegisterMode) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      // nach erfolgreichem Login/Register automatisch geschlossen
    } catch (err) {
      setError(err.message || 'Fehler beim Authentifizieren');
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
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '320px'
        }}
      >
        <h2>{isRegisterMode ? 'Registrieren' : 'Login'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>E-Mail:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '6px' }}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Passwort:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '6px' }}
            />
          </div>

          {isRegisterMode && (
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>
                Passwort wiederholen:
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                style={{ width: '100%', padding: '6px' }}
              />
            </div>
          )}

          <button type="submit" style={{ marginTop: '10px' }}>
            {isRegisterMode ? 'Registrieren' : 'Login'}
          </button>
        </form>

        <button
          onClick={toggleMode}
          style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
        >
          {isRegisterMode
            ? 'Schon registriert? Zum Login wechseln'
            : 'Noch keinen Account? Registrieren'}
        </button>

        <button
          onClick={closeLoginDialog}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: 'gray',
            cursor: 'pointer'
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

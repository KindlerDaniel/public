import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AuthForms.css';

export default function InlineRegisterForm() {
  const { register, isAuthenticated } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password || !passwordConfirm) {
      setError('Bitte füllen Sie alle Felder aus');
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      setIsLoading(false);
      return;
    }

    try {
      await register(username, password);
    } catch (err) {
      setError(err.message || 'Fehler bei der Registrierung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Benutzername</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Passwort</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Passwort bestätigen</label>
        <input 
          type="password" 
          value={passwordConfirm} 
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="form-input"
        />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <button 
        type="submit" 
        disabled={isLoading}
        className="auth-btn"
      >
        {isLoading ? (
          <span className="auth-loading">
            <svg width="18" height="18" viewBox="0 0 50 50" style={{verticalAlign:'middle'}}><circle cx="25" cy="25" r="20" fill="none" stroke="#1976d2" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.8s" from="0 25 25" to="360 25 25"/></circle></svg>
            Lädt...
          </span>
        ) : 'Registrieren'}
      </button>
    </form>
  );
}

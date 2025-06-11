import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

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
    <div className="inline-auth-form">
      <h3>Registrieren</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Benutzername:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Passwort:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <div>
          <label>Passwort bestätigen:</label>
          <input 
            type="password" 
            value={passwordConfirm} 
            onChange={(e) => setPasswordConfirm(e.target.value)} 
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Lädt...' : 'Registrieren'}
        </button>
      </form>
    </div>
  );
}

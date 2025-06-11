import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function InlineLoginForm() {
  const { login, isAuthenticated } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return null;

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
    } catch (err) {
      setError(err.message || 'Fehler beim Login');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForms = () => {
    // implement toggleForms logic here
  };

  return (
    <div className="inline-auth-form">
      <h3>Anmelden</h3>
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Lädt...' : 'Anmelden'}
        </button>
      </form>
      <button 
        className="switch-form-button" 
        onClick={toggleForms}
      >
        Noch kein Konto? Registrieren
      </button>
    </div>
  );
}

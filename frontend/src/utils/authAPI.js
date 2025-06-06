// src/utils/authAPI.js
const API_URL = 'http://localhost:8000/api/auth';

async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login fehlgeschlagen');
  }
  return res.json();
}

async function registerRequest(email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registrierung fehlgeschlagen');
  }
  return res.json();
}

async function fetchCurrentUser(token) {
  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error('Fehler beim Laden des Benutzers');
  }
  return res.json();
}

const authAPI = {
  loginRequest,
  registerRequest,
  fetchCurrentUser
};

export default authAPI;

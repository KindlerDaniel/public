// src/utils/authAPI.js
const API_URL = 'http://localhost:8000/api/auth';

async function loginRequest(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login fehlgeschlagen');
  }
  return res.json();
}

async function refreshTokenRequest(refreshToken) {
  const res = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Token refresh failed');
  }
  return res.json();
}

async function registerRequest(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
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
  refreshTokenRequest,
  registerRequest,
  fetchCurrentUser
};

export default authAPI;

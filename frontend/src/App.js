import React from 'react';
import './App.css';
import Layout from './Layout.js';
import { AppProvider } from './context/AppContext.js';
import { ViewProvider } from './context/ViewContext.js';
import { AuthProvider } from './context/AuthContext.js';
import LoginDialog from './components/LoginDialog.jsx';
import RegisterDialog from './components/RegisterDialog.jsx'; // ← NEU HINZUGEFÜGT

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ViewProvider>
          <div className="App">
            <Layout />
            <LoginDialog />
            <RegisterDialog /> {/* ← NEU HINZUGEFÜGT */}
          </div>
        </ViewProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
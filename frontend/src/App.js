import React from 'react';
import './App.css';
import Layout from './Layout.js'; // Wichtig: .js Dateiendung hinzufügen!
import { AppProvider } from './context/AppContext.js';
import { ViewProvider } from './context/ViewContext.js';

function App() {
  return (
    <AppProvider>
      <ViewProvider>
        <div className="App">
          <Layout />
        </div>
      </ViewProvider>
    </AppProvider>
  );
}

export default App;
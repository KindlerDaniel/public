// frontend/src/levels/4IndividualLevel/IndividualLevelView.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './IndividualLevel.css';
import InlineLoginForm from './LoginForm';
import InlineRegisterForm from './RegisterForm';
import MyContents from './MyContents';

const IndividualLevelView = () => {
  const [activeTab, setActiveTab] = useState(1); // Standardmäßig "Inhalte"-Tab

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <div className="individual-level">
      <div className="auth-section">
        {isAuthenticated ? (
          <>
            <div className="tabs-header">
              <div className="tabs-nav">
                {['Auftritt', 'Inhalte', 'Folgen', 'Vertrauen', 'Follower'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === idx ? ' active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tab}
                  </button>
                ))}
                <span className="user-name" style={{marginLeft: 24, marginRight: 8}}>{user.name || user.email}</span>
                <button className="logout-modern" onClick={logout} aria-label="Logout">
                  <svg className="icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="tab-content">
              {activeTab === 0 && (
                <div className="tab-panel">
                  <h3>Auftritt</h3>
                  <p>Hier kannst du deinen Auftritt verwalten. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 1 && (
                <MyContents />
              )}
              {activeTab === 2 && (
                <div className="tab-panel">
                  <h3>Folgen</h3>
                  <p>Hier werden deine Folgen angezeigt. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 3 && (
                <div className="tab-panel">
                  <h3>Vertrauen</h3>
                  <p>Hier siehst du Vertrauensinformationen. (Platzhalter)</p>
                </div>
              )}
              {activeTab === 4 && (
                <div className="tab-panel">
                  <h3>Follower</h3>
                  <p>Hier werden deine Follower angezeigt. (Platzhalter)</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="auth-tabs">
              <button
                className={`auth-tab${!showRegisterForm ? ' active' : ''}`}
                onClick={() => setShowRegisterForm(false)}
                aria-pressed={!showRegisterForm}
                type="button"
              >
                ANMELDEN
              </button>
              <button
                className={`auth-tab${showRegisterForm ? ' active' : ''}`}
                onClick={() => setShowRegisterForm(true)}
                aria-pressed={showRegisterForm}
                type="button"
              >
                REGISTRIEREN
              </button>
            </div>
            <div className="auth-forms">
              {showRegisterForm ? <InlineRegisterForm /> : <InlineLoginForm />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IndividualLevelView;

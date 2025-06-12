// frontend/src/levels/4IndividualLevel/IndividualLevelView.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './IndividualLevel.css';
import './AuthForms.css';
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
            <div style={{
              width: '100%',
              backgroundColor: '#f5f8fa',
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.04)',
              padding: '12px 0',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                padding: '0 24px',
                boxSizing: 'border-box',
                alignItems: 'center'
              }}>
                {['Auftritt', 'Inhalte', 'Folgen', 'Vertrauen', 'Follower'].map((tab, idx) => (
                  <button
                    key={tab}
                    className={`tab-btn${activeTab === idx ? ' active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tab}
                  </button>
                ))}
                <span className="user-name" style={{marginLeft: 'auto', marginRight: 8}}>{user.name || user.email}</span>
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
            <div className="inline-auth-form" style={{marginTop: '48px'}}>
              <div className="auth-tabs" style={{display:'flex',justifyContent:'center',gap:12,marginBottom:18}}>
                <button
                  className={`auth-tab${!showRegisterForm ? ' active' : ''}`}
                  style={{
                    background: !showRegisterForm ? 'linear-gradient(90deg,#1976d2 60%,#64b5f6 100%)' : '#f8fafc',
                    color: !showRegisterForm ? '#fff' : '#1976d2',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: 600,
                    padding: '12px 32px',
                    fontSize: '1.08rem',
                    cursor: 'pointer',
                    transition: 'background 0.18s,color 0.18s',
                    boxShadow: !showRegisterForm ? '0 2px 8px rgba(25,118,210,0.08)' : 'none'
                  }}
                  onClick={() => setShowRegisterForm(false)}
                  aria-pressed={!showRegisterForm}
                  type="button"
                >
                  ANMELDEN
                </button>
                <button
                  className={`auth-tab${showRegisterForm ? ' active' : ''}`}
                  style={{
                    background: showRegisterForm ? 'linear-gradient(90deg,#1976d2 60%,#64b5f6 100%)' : '#f8fafc',
                    color: showRegisterForm ? '#fff' : '#1976d2',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: 600,
                    padding: '12px 32px',
                    fontSize: '1.08rem',
                    cursor: 'pointer',
                    transition: 'background 0.18s,color 0.18s',
                    boxShadow: showRegisterForm ? '0 2px 8px rgba(25,118,210,0.08)' : 'none'
                  }}
                  onClick={() => setShowRegisterForm(true)}
                  aria-pressed={showRegisterForm}
                  type="button"
                >
                  REGISTRIEREN
                </button>
              </div>
              <div className="auth-forms" style={{maxWidth:400,margin:'0 auto'}}>
                {showRegisterForm ? <InlineRegisterForm /> : <InlineLoginForm />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IndividualLevelView;

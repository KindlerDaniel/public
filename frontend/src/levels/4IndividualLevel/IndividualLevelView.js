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
              width: 'calc(100% - 50px)', /* Exakt dieselbe Breite wie im layout.css für app-content */
              backgroundColor: '#f5f8fa',
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.04)',
              padding: '12px 0',
              position: 'fixed',
              top: 0,
              left: '50px', /* Exakt dieselbe Breite wie die Sidebar im layout.css */
              right: 0,
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
            <div className="tab-content" style={{ marginTop: '60px' }}>
              {activeTab === 0 && (
                <div className="tab-panel">
                  {/* Leerer Tab Auftritt */}
                </div>
              )}
              {activeTab === 1 && (
                <MyContents />
              )}
              {activeTab === 2 && (
                <div className="tab-panel">
                  {/* Leerer Tab Folgen */}
                </div>
              )}
              {activeTab === 3 && (
                <div className="tab-panel">
                  {/* Leerer Tab Vertrauen */}
                </div>
              )}
              {activeTab === 4 && (
                <div className="tab-panel">
                  {/* Leerer Tab Follower */}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="inline-auth-form" style={{maxWidth: '280px', margin: '20px 0 0 80px'}}>
              <div className="auth-tabs" style={{display:'flex',justifyContent:'flex-start',gap:12,marginBottom:18,paddingLeft:10}}>
                <button
                  className={`auth-tab${!showRegisterForm ? ' active' : ''}`}
                  style={{
                    background: '#f8fafc',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: !showRegisterForm ? 700 : 400,
                    padding: '12px 32px',
                    fontSize: !showRegisterForm ? '1.4rem' : '0.85rem',
                    cursor: 'pointer',
                    transition: 'font-size 0.18s, font-weight 0.18s',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100px',
                    minHeight: '50px'
                  }}
                  onClick={() => setShowRegisterForm(false)}
                  aria-pressed={!showRegisterForm}
                  type="button"
                >
                  Anmelden
                </button>
                <button
                  className={`auth-tab${showRegisterForm ? ' active' : ''}`}
                  style={{
                    background: '#f8fafc',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px 8px 0 0',
                    fontWeight: showRegisterForm ? 700 : 400,
                    padding: '12px 32px',
                    fontSize: showRegisterForm ? '1.4rem' : '0.85rem',
                    cursor: 'pointer',
                    transition: 'font-size 0.18s, font-weight 0.18s',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '100px',
                    minHeight: '50px'
                  }}
                  onClick={() => setShowRegisterForm(true)}
                  aria-pressed={showRegisterForm}
                  type="button"
                >
                  Registrieren
                </button>
              </div>
              <div className="auth-forms" style={{margin:'0 auto'}}>
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

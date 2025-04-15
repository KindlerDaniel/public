import React from 'react';
import '../styles/sidebar.css';

interface SidebarProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'society', label: 'Gesellschaft', icon: '🌍' },
    { id: 'group', label: 'Gruppen', icon: '👥' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'personal', label: 'Profil', icon: '👤' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Public</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {modes.map((mode) => (
            <li key={mode.id}>
              <button
                className={`sidebar-nav-button ${currentMode === mode.id ? 'active' : ''}`}
                onClick={() => onModeChange(mode.id)}
                title={mode.label}
              >
                <span className="sidebar-icon">{mode.icon}</span>
                <span className="sidebar-label">{mode.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
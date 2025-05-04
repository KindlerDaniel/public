import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { 
      id: 'society', 
      label: 'Gesellschaft', 
      iconPath: '/assets/icons/society_icon.svg'
    },
    { 
      id: 'group', 
      label: 'Gruppen', 
      iconPath: '/assets/icons/group_icon.svg'
    },
    { 
      id: 'chat', 
      label: 'Chat', 
      iconPath: '/assets/icons/chat_icon.svg'
    },
    { 
      id: 'personal', 
      label: 'Profil', 
      iconPath: '/assets/icons/person_icon.svg'
    }
  ];

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {modes.map((mode) => (
            <li key={mode.id}>
              <button
                className={`sidebar-nav-button ${currentMode === mode.id ? 'active' : ''}`}
                onClick={() => onModeChange(mode.id)}
                title={mode.label} // Behält den Tooltip bei
              >
                <span className="sidebar-icon">
                  <img src={mode.iconPath} alt={mode.label} className="sidebar-icon-img" />
                </span>
                {/* Label entfernt */}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
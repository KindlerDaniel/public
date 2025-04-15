// Header.tsx
import React, { useState, useEffect } from 'react';
import '../styles/Header.css';

interface NavItem {
  name: string;
  url: string;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const navItems: NavItem[] = [
    { name: 'Gesellschaft', url: '#/society' },
    { name: 'Gruppen', url: '#/groups' },
    { name: 'Chats', url: '#/chats' },
    { name: 'Profil', url: '#/profile' }
  ];
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, this would trigger a search
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container">
          <a href="#/" className="logo">
            Public
          </a>
          <div className="logo-tagline">Fokus auf Inhalte</div>
        </div>
        
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Suche nach Inhalten..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="submit">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
          </button>
        </form>
        
        <nav className="main-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.name}>
                <a 
                  href={item.url} 
                  className="nav-link"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="user-controls">
          <button className="notifications-button">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
            </svg>
          </button>
          
          <div className="user-avatar">
            <img 
              src="/api/placeholder/40/40" 
              alt="Benutzeravatar" 
              width="40" 
              height="40"
            />
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Menü öffnen"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            fill="currentColor"
          >
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <nav>
            <ul>
              {navItems.map(item => (
                <li key={item.name}>
                  <a 
                    href={item.url} 
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Suche nach Inhalten..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button type="submit">Suchen</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
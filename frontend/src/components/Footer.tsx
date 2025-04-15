// Footer.tsx
import React, { useState } from 'react';
import '../styles/Footer.css';

interface FooterLink {
  name: string;
  url: string;
}

const Footer: React.FC = () => {
  const [showExtendedInfo, setShowExtendedInfo] = useState<boolean>(false);
  
  const currentYear = new Date().getFullYear();
  
  const links: FooterLink[] = [
    { name: 'Datenschutz', url: '#/privacy' },
    { name: 'Nutzungsbedingungen', url: '#/terms' },
    { name: 'Impressum', url: '#/imprint' },
    { name: 'Kontakt', url: '#/contact' }
  ];
  
  const socialLinks: FooterLink[] = [
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' }
  ];
  
  const toggleExtendedInfo = () => {
    setShowExtendedInfo(!showExtendedInfo);
  };
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-basic">
          <div className="footer-copyright">
            © {currentYear} Public
          </div>
          
          <div className="footer-links">
            {links.map((link, index) => (
              <React.Fragment key={link.name}>
                <a href={link.url} className="footer-link">
                  {link.name}
                </a>
                {index < links.length - 1 && <span className="link-separator">•</span>}
              </React.Fragment>
            ))}
          </div>
          
          <button 
            className={`footer-expand-button ${showExtendedInfo ? 'expanded' : ''}`}
            onClick={toggleExtendedInfo}
            aria-label={showExtendedInfo ? "Weniger anzeigen" : "Mehr anzeigen"}
          >
            <svg 
              viewBox="0 0 24 24" 
              width="16" 
              height="16"
              fill="currentColor"
              style={{ transform: showExtendedInfo ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M7 10l5 5 5-5z"></path>
            </svg>
          </button>
        </div>
        
        {showExtendedInfo && (
          <div className="footer-extended">
            <div className="footer-section">
              <h4>Über Public</h4>
              <p>
                Public ist ein soziales Netzwerk, das sich auf hochwertige Inhalte
                und einen respektvollen Austausch konzentriert. Unsere Plattform
                fördert Kreativität, Wissen und Humor in einer vertrauenswürdigen Umgebung.
              </p>
            </div>
            
            <div className="footer-section">
              <h4>Folge uns</h4>
              <div className="social-links">
                {socialLinks.map(link => (
                  <a 
                    key={link.name} 
                    href={link.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Newsletter</h4>
              <form className="newsletter-form">
                <input 
                  type="email"
                  placeholder="Deine E-Mail-Adresse"
                  aria-label="E-Mail für Newsletter"
                />
                <button type="submit">Abonnieren</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        padding: '10px',
        backgroundColor: '#282c34',
        color: 'white',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        textAlign: 'center'
      }}
    >
      <p>© 2025 Meine App</p>
    </footer>
  );
};

export default Footer;

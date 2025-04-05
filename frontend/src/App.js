import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

function App() {
  const [isRed, setIsRed] = useState(false);

  const handleClick = () => {
    setIsRed(true);
  };

  return (
    <div className="App">
      <Header />
      <main>
        <button className={isRed ? 'blue' : ''} onClick={handleClick}>
          Hey
        </button>
      </main>
      <Footer />
    </div>
  );
}

export default App;

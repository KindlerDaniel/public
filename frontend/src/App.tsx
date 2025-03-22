import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isRed, setIsRed] = useState(false);

  const handleClick = () => {
    setIsRed(true);
  };

  return (
    <div className="App">
      <Header />
      <main>
        <button className={isRed ? 'red' : ''} onClick={handleClick}>
          Hey
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default App;

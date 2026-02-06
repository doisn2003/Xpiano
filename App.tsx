import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-body">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Marketplace />
      </main>
      <Footer />
    </div>
  );
}

export default App;

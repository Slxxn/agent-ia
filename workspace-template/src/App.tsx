import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/blocks/layout/Navbar';
import Footer from '@/blocks/layout/Footer';
import { SITE_CONFIG } from '@/siteConfig';
// PAGE_IMPORTS

function App() {
  return (
    <>
      <Navbar config={SITE_CONFIG.navbar} />
      <main>
        <Routes>
          {/* ROUTES */}
        </Routes>
      </main>
      <Footer config={SITE_CONFIG.footer} />
    </>
  );
}

export default App;

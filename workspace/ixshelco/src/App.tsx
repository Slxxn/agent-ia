import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Admin from './pages/Admin';
import Booking from './pages/Booking';
import Profile from './pages/Profile';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export const App: React.FC = () => {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    const unsub = init();
    return unsub;
  }, [init]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1a1412',
            border: '1px solid #e5e2df',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#2d6a4f', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#c1121f', secondary: '#ffffff' },
          },
        }}
      />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

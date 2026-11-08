// App.jsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from './pages/header';
import Footer from './pages/footer';
import ScrollToTop from './components/scrollToTop';
import InfoBanner from './pages/services';

function App() {
  const location = useLocation();
  const hideHeaderFooter =
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/admin');

  // Count one visit per browser session; admin pages don't count
  useEffect(() => {
    if (location.pathname.startsWith('/admin') || sessionStorage.getItem('visitCounted')) return;
    sessionStorage.setItem('visitCounted', '1');
    axios.post(`${import.meta.env.VITE_API_URL}/api/visit`).catch(() => {
      sessionStorage.removeItem('visitCounted');
    });
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      {!hideHeaderFooter && <Header />}
      <div key={location.pathname} className="page-fade">
        <Outlet />
      </div>
      {!hideHeaderFooter && <InfoBanner />}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;

// App.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Header from './pages/header';
import Footer from './pages/footer';
import ScrollToTop from './components/scrollToTop';
import InfoBanner from './pages/services';

function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/forgot-password');

  return (
    <>
      <ScrollToTop />
      {!hideHeaderFooter && <Header />}
      <Outlet />
      {!hideHeaderFooter && <InfoBanner />}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

export default App;

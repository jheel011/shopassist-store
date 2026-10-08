import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { firebaseConfigured } from './firebase';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { EmptyState } from './components/States';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Policies from './pages/Policies';
import About from './pages/About';
import SetupNeeded from './pages/SetupNeeded';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
}

function NotFound() {
  return (
    <div className="container page-pad">
      <EmptyState
        icon={Compass}
        title="Page not found"
        text="The page you’re looking for doesn’t exist or has moved."
        action={<Link to="/" className="btn btn-dark">Back to home</Link>}
      />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>
          <ScrollToTop />
          <Navbar />
          {/* keyed on pathname so every route change replays the fade-in transition */}
          <main key={location.pathname} className="page">
            {firebaseConfigured ? (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/login" element={<Login />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            ) : (
              <SetupNeeded />
            )}
          </main>
          <Footer />
          <Chatbot />
        </ShopProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

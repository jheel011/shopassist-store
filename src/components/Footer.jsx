import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { Logo, openAssistant } from './Navbar';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo light />
          <p>
            Shopping made smarter. Discover products, track orders and handle returns with an AI assistant that
            actually knows your store.
          </p>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4>About</h4>
          <Link to="/about">About ShopAssist</Link>
          <Link to="/shop">Shop all products</Link>
          <Link to="/about#how-it-works">How the AI works</Link>
        </div>

        <div>
          <h4>Customer Support</h4>
          <button onClick={() => openAssistant()}>Ask ShopAssist</button>
          <Link to="/orders">Track an order</Link>
          <a href="mailto:support@shopassist.demo">support@shopassist.demo</a>
        </div>

        <div>
          <h4>Policies</h4>
          <Link to="/policies#returns">Returns &amp; refunds</Link>
          <Link to="/policies#shipping">Shipping &amp; delivery</Link>
          <Link to="/policies#payments">Payments</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ShopAssist AI. All rights reserved.</span>
        <span>A college project · built with React, Firebase &amp; Gemini</span>
      </div>
    </footer>
  );
}

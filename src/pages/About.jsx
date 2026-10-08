import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Database, ShieldCheck, Server, ArrowRight } from 'lucide-react';
import { openAssistant } from '../components/Navbar';

const STEPS = [
  {
    icon: Database,
    title: 'It reads your store, live',
    text: 'When you open the chat, ShopAssist loads the catalogue, store policies and — if you are signed in — only your own orders and returns from Firestore.',
  },
  {
    icon: Server,
    title: 'A serverless function calls Gemini',
    text: 'Your question and that context go to a serverless function. The Gemini API key lives only on the server and is never shipped to the browser.',
  },
  {
    icon: ShieldCheck,
    title: 'Answers stay grounded',
    text: 'The assistant is instructed to answer only from the data it is given, link to real products, and say so when it does not know.',
  },
];

export default function About() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <div className="container page-pad narrow">
      <header className="page-head">
        <div>
          <span className="eyebrow">About</span>
          <h1>Shopping, with an assistant that knows the store.</h1>
          <p className="muted">
            ShopAssist AI is an e-commerce platform with an AI shopping assistant built directly into the experience —
            browse, buy, track and return, or just ask.
          </p>
        </div>
      </header>

      <section id="how-it-works" className="about-steps">
        <h2>How the AI works</h2>
        {STEPS.map((s, i) => (
          <div key={s.title} className="about-step">
            <span className="benefit-icon">
              <s.icon size={22} />
            </span>
            <div>
              <h3>
                {i + 1}. {s.title}
              </h3>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="about-tech">
        <h2>Built with</h2>
        <div className="tags">
          {['React', 'Vite', 'React Router', 'Firebase Auth', 'Cloud Firestore', 'Gemini API', 'Netlify Functions'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      <div className="about-cta">
        <button className="btn btn-primary btn-lg" onClick={() => openAssistant()}>
          <Sparkles size={18} /> Talk to ShopAssist
        </button>
        <Link to="/shop" className="btn btn-ghost btn-lg">
          Browse the shop <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, FileText } from 'lucide-react';
import { fetchPolicies } from '../services/db';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';

export default function Policies() {
  const { hash } = useLocation();
  const [policies, setPolicies] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(hash.replace('#', '') || 'returns');

  const load = () => {
    setError('');
    setPolicies(null);
    fetchPolicies()
      .then(setPolicies)
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  useEffect(() => {
    const id = hash.replace('#', '');
    if (id) setOpen(id);
  }, [hash]);

  useEffect(() => {
    if (!policies || !hash) return;
    document.getElementById(hash.replace('#', ''))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [policies, hash]);

  return (
    <div className="container page-pad narrow">
      <header className="page-head">
        <div>
          <span className="eyebrow">Help centre</span>
          <h1>Store policies</h1>
          <p className="muted">Everything about returns, shipping and payments — the same policies ShopAssist AI answers from.</p>
        </div>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !policies ? (
        <div className="stack">
          <Skeleton h={64} r={18} />
          <Skeleton h={64} r={18} />
          <Skeleton h={64} r={18} />
        </div>
      ) : policies.length === 0 ? (
        <EmptyState icon={FileText} title="No policies published yet" text="Policies appear here once the demo data has been loaded." />
      ) : (
        <div className="accordion">
          {policies.map((p) => (
            <section key={p.id} id={p.id} className={`acc-item ${open === p.id ? 'open' : ''}`}>
              <button onClick={() => setOpen(open === p.id ? '' : p.id)} aria-expanded={open === p.id}>
                {p.title}
                <ChevronDown size={18} />
              </button>
              {open === p.id && <p>{p.content}</p>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

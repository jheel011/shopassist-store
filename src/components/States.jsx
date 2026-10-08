import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth, friendlyAuthError } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="state">
      <div className="state-icon">{Icon && <Icon size={30} strokeWidth={1.5} />}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state error">
      <div className="state-icon">
        <AlertTriangle size={30} strokeWidth={1.5} />
      </div>
      <h3>Something went wrong</h3>
      <p>{message || 'We could not load this right now.'}</p>
      {onRetry && (
        <button className="btn btn-dark" onClick={onRetry}>
          <RefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  );
}

// Shown when Firestore has no products yet. Signing in as a demo user seeds the
// catalogue, policies and that user's orders in one go.
export function EmptyCatalog({ onLoaded }) {
  const { signInDemo } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      await signInDemo('rahul');
      toast.success('Demo catalogue loaded');
      onLoaded?.();
    } catch (e) {
      toast.error(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EmptyState
      icon={Sparkles}
      title="Your catalogue is empty"
      text="Load the demo catalogue (21 products, policies and sample orders) into Firestore by signing in as Rahul."
      action={
        <button className="btn btn-primary" onClick={load} disabled={busy}>
          {busy ? 'Loading demo data…' : 'Load demo data'}
        </button>
      }
    />
  );
}

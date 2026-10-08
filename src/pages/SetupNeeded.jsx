import { KeyRound } from 'lucide-react';

export default function SetupNeeded() {
  return (
    <div className="container page-pad narrow">
      <div className="state setup">
        <div className="state-icon">
          <KeyRound size={30} strokeWidth={1.5} />
        </div>
        <h3>Connect Firebase to get started</h3>
        <p>ShopAssist AI needs your Firebase project keys. Copy <code>.env.example</code> to <code>.env</code>, fill in the six <code>VITE_FIREBASE_*</code> values, then restart the dev server.</p>
        <ol>
          <li>Create a Firebase project and add a Web app.</li>
          <li>Enable <b>Authentication → Email/Password</b>.</li>
          <li>Create a <b>Firestore</b> database and publish <code>firestore.rules</code>.</li>
          <li>Paste the web config values into <code>.env</code>.</li>
        </ol>
        <p className="muted">The full walkthrough is in README.md.</p>
      </div>
    </div>
  );
}

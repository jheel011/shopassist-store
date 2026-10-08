import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DEMO_USERS } from '../data/seed';
import { ensureDemoData, seedCatalogIfEmpty } from '../services/db';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const toProfile = (u) =>
  u
    ? {
        uid: u.uid,
        name: u.displayName || u.email?.split('@')[0] || 'Guest',
        email: u.email,
        avatar: u.photoURL || '',
        isDemo: Boolean(u.email?.endsWith('@shopassist.demo')),
      }
    : null;

export function friendlyAuthError(e) {
  switch (e?.code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return e?.message || 'Something went wrong. Please try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setReady(true);
      return undefined;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(toProfile(u));
      setReady(true);
    });
  }, []);

  const signInDemo = useCallback(async (key) => {
    const d = DEMO_USERS[key];
    if (!auth || !db) throw new Error('Firebase is not configured yet. Add your keys to .env');
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, d.email, d.password);
    } catch (e) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
          cred = await createUserWithEmailAndPassword(auth, d.email, d.password);
        } catch (e2) {
          if (e2.code === 'auth/email-already-in-use') {
            throw new Error(
              'This demo account already exists with a different password. Reset it in the Firebase console.'
            );
          }
          throw e2;
        }
      } else {
        throw e;
      }
    }
    if (cred.user.displayName !== d.name) {
      await updateProfile(cred.user, { displayName: d.name, photoURL: d.avatar });
    }
    await setDoc(doc(db, 'users', cred.user.uid), { name: d.name, email: d.email, avatar: d.avatar }, { merge: true });
    await ensureDemoData(cred.user.uid, key);
    setUser(toProfile(auth.currentUser));
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase is not configured yet. Add your keys to .env');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    if (!auth || !db) throw new Error('Firebase is not configured yet. Add your keys to .env');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6d5efc&color=fff&bold=true`;
    await updateProfile(cred.user, { displayName: name, photoURL: avatar });
    await setDoc(doc(db, 'users', cred.user.uid), { name, email, avatar });
    try {
      await seedCatalogIfEmpty();
    } catch {
      /* non-fatal */
    }
    setUser(toProfile(auth.currentUser));
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signInDemo, signIn, signUp, signOut }),
    [user, ready, signInDemo, signIn, signUp, signOut]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

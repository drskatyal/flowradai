/**
 * Mock Clerk shim for the no-auth demo/NHS-test build.
 * Every hook reports "signed in as a demo user" so the app renders fully
 * without any Clerk account, publishable key, or network call to Clerk.
 */
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: 'demo-user-id',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  primaryEmailAddress: { emailAddress: 'demo@flowrad.ai' },
  emailAddresses: [{ emailAddress: 'demo@flowrad.ai' }],
  imageUrl: '',
  publicMetadata: {},
  unsafeMetadata: {},
  update: async () => {},
};

const MOCK_AUTH = {
  isLoaded: true,
  isSignedIn: true,
  userId: 'demo-user-id',
  sessionId: 'demo-session-id',
  getToken: async () => 'demo-token',
  signOut: async () => {},
  has: () => false,
  orgId: null,
  orgRole: null,
  orgSlug: null,
};

// ── Context ───────────────────────────────────────────────────────────────────

const ClerkContext = createContext(MOCK_AUTH);

// ── ClerkProvider — just renders children, no real Clerk ────────────────────

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <ClerkContext.Provider value={MOCK_AUTH}>{children}</ClerkContext.Provider>;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth() {
  return MOCK_AUTH;
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: MOCK_USER,
  };
}

export function useClerk() {
  const navigate = useNavigate();
  return {
    signOut: async () => navigate('/'),
    openSignIn: () => {},
    openSignUp: () => {},
    user: MOCK_USER,
  };
}

export function useSession() {
  return {
    isLoaded: true,
    isSignedIn: true,
    session: { id: 'demo-session-id', getToken: async () => 'demo-token' },
  };
}

export function useSignIn() {
  return { isLoaded: true, signIn: null, setActive: async () => {} };
}

export function useSignUp() {
  return { isLoaded: true, signUp: null, setActive: async () => {} };
}

// ── Components ───────────────────────────────────────────────────────────────

export function SignedIn({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SignedOut(_: { children: React.ReactNode }) {
  return null;
}

export function RedirectToSignIn() {
  return null;
}

export function RedirectToSignUp() {
  return null;
}

// Render a simple placeholder instead of Clerk's auth UI
function AuthPlaceholder({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f172a', color: '#e2e8f0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 16,
        padding: '48px 56px', maxWidth: 400, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>FlowRad Lite</h2>
        <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
          Demo build — authentication bypassed
        </p>
        <a href="/" style={{
          display: 'inline-block', background: '#4f46e5', color: '#fff',
          borderRadius: 8, padding: '10px 28px', textDecoration: 'none',
          fontWeight: 600, fontSize: 15,
        }}>
          Continue to App →
        </a>
      </div>
    </div>
  );
}

export function SignIn(_props: any) {
  return <AuthPlaceholder mode="sign-in" />;
}

export function SignUp(_props: any) {
  return <AuthPlaceholder mode="sign-up" />;
}

export function UserButton(_props: any) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', background: '#4f46e5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    }}>D</div>
  );
}

export function UserProfile(_props: any) {
  return null;
}

// ── Misc exports that some components may import ─────────────────────────────

export const Clerk = null;
export const buildClerkProps = () => ({});
export const createClerkClient = () => ({});

/**
 * Root application for the lite (single-file) build.
 *
 * Replaces apps/client/src/app/layout.tsx:
 *  - ClerkProvider from @clerk/clerk-react wired to React Router navigation
 *  - BrowserRouter replaces Next.js App Router
 *  - All existing providers reused unchanged
 *  - No GTM / tracking (NHS build)
 */
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';

import { ClientProvider, TokenProvider, StateClearProvider, RuntimeProvider } from '@/providers';
import SidebarProvider from '@/providers/sidebar-provider';
import { SessionGuard } from '@/components/session-guard';
import { VADConfig } from '@/components/customs/mic/voice-activity-detection/vad-config';
import { ChunkErrorErrorBoundary } from '@/components/error/chunk-error-boundary';
import { ThreadProvider, VoiceCommandProvider } from '@/providers';

import '@/app/global.css';

import { Home } from '@/modules/home';
import { Thread } from '@/modules/thread';
import { Template } from '@/modules/template';
import ReportHistory from '@/modules/history';
import { Onboarding } from '@/modules/onboarding';
import { FloatingWindow } from '@/modules/floating-window/floating-window';

// ── Clerk must be inside BrowserRouter so it can call useNavigate ────────────
function ClerkWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const publishableKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ?? '';

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/auth/sign-in"
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}

// ── Provider stack (mirrors layout.tsx order) ────────────────────────────────
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <TokenProvider>
        <ChunkErrorErrorBoundary>
          <Suspense>
            <StateClearProvider />
            <SessionGuard />
            <VADConfig />
            <SidebarProvider>
              <RuntimeProvider>{children}</RuntimeProvider>
            </SidebarProvider>
          </Suspense>
        </ChunkErrorErrorBoundary>
      </TokenProvider>
    </ClientProvider>
  );
}

// ── Auth-guarded wrapper ─────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

// ── Floating overlay page (own provider subtree, transparent bg) ─────────────
function FloatingPage() {
  React.useEffect(() => {
    const root = document.getElementById('root');
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.body.classList.add('floating-body');
    if (root) root.style.backgroundColor = 'transparent';
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.classList.remove('floating-body');
      if (root) root.style.backgroundColor = '';
    };
  }, []);

  return (
    <ThreadProvider>
      <VoiceCommandProvider>
        <FloatingWindow />
      </VoiceCommandProvider>
    </ThreadProvider>
  );
}

// ── Sign-up: preserve referral/coupon codes from URL params ──────────────────
function SignUpPage() {
  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = p.get('ref') ?? p.get('referralCode');
    if (ref) localStorage.setItem('pendingReferralCode', ref);
    const coupon = p.get('coupon') ?? p.get('couponCode');
    if (coupon) localStorage.setItem('pendingCouponCode', coupon);
  }, []);
  return <SignUp signInUrl="/auth/sign-in" oauthFlow="popup" />;
}

// ── Route table ──────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/sign-in" element={<SignIn signUpUrl="/auth/sign-up" oauthFlow="popup" />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/floating" element={<FloatingPage />} />

      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/thread/:threadId" element={<ProtectedRoute><Thread /></ProtectedRoute>} />
      <Route path="/template" element={<ProtectedRoute><Template /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ReportHistory /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Suspense><Onboarding /></Suspense></ProtectedRoute>} />

      <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    </Routes>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ClerkWithRouter>
        <Providers>
          <AppRoutes />
        </Providers>
      </ClerkWithRouter>
    </BrowserRouter>
  );
}

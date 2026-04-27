/**
 * next/script shim — in the lite build all scripts are bundled; this is a no-op.
 * For analytics/GTM scripts that were injected via next/script in layout.tsx,
 * we deliberately omit them (NHS build has no tracking by design).
 */
import React from 'react';

interface ScriptProps {
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  id?: string;
  dangerouslySetInnerHTML?: { __html: string };
  onLoad?: () => void;
  onReady?: () => void;
  onError?: () => void;
  children?: React.ReactNode;
}

const Script: React.FC<ScriptProps> = () => null;

Script.displayName = 'Script';

export default Script;

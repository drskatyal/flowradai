/**
 * next/navigation shim for the Vite lite build.
 * Provides React Router v6 equivalents of all Next.js navigation hooks.
 */

export {
  useParams,
  useNavigate as _useNavigate,
  useLocation as _useLocation,
} from 'react-router-dom';

import { useNavigate, useLocation, useSearchParams as useRRSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

// Next.js returns the params object directly; React Router's hook returns [params, setter].
export function useSearchParams(): URLSearchParams {
  const [searchParams] = useRRSearchParams();
  return searchParams;
}

// Server-side redirect is a no-op on the client — callers should use useRouter().replace() instead.
export function redirect(url: string): never {
  window.location.replace(url);
  throw new Error('redirect');
}

export function notFound(): never {
  window.location.replace('/not-found');
  throw new Error('not-found');
}

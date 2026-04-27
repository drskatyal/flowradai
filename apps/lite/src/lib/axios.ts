/**
 * Lite-build axios override.
 *
 * Identical to apps/client/src/lib/axios.ts except:
 *  - Reads the API base URL from import.meta.env.VITE_API_URL
 *  - nextAxios base URL is set to VITE_API_URL so that calls that previously
 *    hit a Next.js API route (/api/...) now hit the Express server instead.
 *    The Soniox temp-key endpoint was moved to POST /soniox/temporary-key on
 *    the Express server; callers should use that path via serverAxios.
 */
import axios, { InternalAxiosRequestConfig } from 'axios';

type GetTokenOptions = {
  template?: string;
  organizationId?: string;
  leewayInSeconds?: number;
  skipCache?: boolean;
};

type GetToken = (options?: GetTokenOptions) => Promise<string | null>;

export let getToken: GetToken | null = null;

export const setGetTokenFunction = (fn: GetToken) => {
  getToken = fn;
};

const apiBaseUrl: string = (import.meta as any).env?.VITE_API_URL ?? '';

const createAxiosInstance = (baseURL: string) =>
  axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const serverAxios = createAxiosInstance(apiBaseUrl);

serverAxios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!getToken) return config;
    const token = await getToken({ template: 'auth' });
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// In the lite build nextAxios also points to the Express server.
// Any call that previously used /api/* Next.js routes must be updated
// to use the corresponding Express endpoint path.
export const nextAxios = createAxiosInstance(apiBaseUrl);

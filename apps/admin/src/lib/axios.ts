import axios, { InternalAxiosRequestConfig } from "axios";

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

const createAxiosInstance = (baseURL: string) =>
  axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const serverAxios = createAxiosInstance(
  process.env.NEXT_PUBLIC_API_URL as string
);

serverAxios.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!getToken) return config;
    const token = await getToken({ template: "auth" });
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const nextAxios = createAxiosInstance("/api");

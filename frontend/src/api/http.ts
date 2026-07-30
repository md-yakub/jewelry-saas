import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

type Envelope<T> = {
  data: T;
  timestamp: string;
};

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const http = axios.create({
  baseURL: API_BASE_URL,
});

let accessToken: string | null = null;
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(http(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post<
        Envelope<{ accessToken: string; refreshToken: string }>
      >(`${API_BASE_URL}/auth/refresh`, { refreshToken });

      const tokens = response.data.data;
      setAccessToken(tokens.accessToken);
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      pendingRequests.forEach((request) => request.resolve(tokens.accessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("memberships");
      localStorage.removeItem("selectedShopId");
      localStorage.removeItem("selectedRole");
      pendingRequests.forEach((request) => request.reject(refreshError));
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function unwrap<T>(response: { data: Envelope<T> }) {
  return response.data.data;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (message) {
    return message;
  }

  if (error.response?.status === 401) {
    return "Invalid email or password.";
  }

  return fallback;
}

function isPublicAuthRequest(config: InternalAxiosRequestConfig) {
  const url = config.url ?? "";
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register-shop") ||
    url.includes("/auth/refresh")
  );
}

export default http;

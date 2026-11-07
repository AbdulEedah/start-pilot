/**
 * API Client for StartPilot Backend
 *
 * Handles JWT authentication, token refresh, and HTTP requests
 * to the Django REST Framework backend.
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Clean trailing slashes and /api suffix so paths starting with /api/v1 work seamlessly
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "").replace(/\/api$/, "");

interface TokenPair {
  access: string;
  refresh: string;
}

export class ApiError extends Error {
  status: number;
  data: Record<string, any>;

  constructor(status: number, data: Record<string, any>) {
    const message =
      (typeof data?.detail === "string" && data.detail) ||
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      (typeof data?.non_field_errors?.[0] === "string" && data.non_field_errors[0]) ||
      `Request failed with status ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Hydrate tokens from localStorage on client side
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
      this.refreshToken = localStorage.getItem("refresh_token");
    }
  }

  // ──────────────────────────────────────────────
  // Token Management
  // ──────────────────────────────────────────────

  setTokens(tokens: TokenPair): void {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken && typeof window !== "undefined") {
      this.refreshToken = localStorage.getItem("refresh_token");
    }
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // ──────────────────────────────────────────────
  // Token Refresh
  // ──────────────────────────────────────────────

  private async attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    // Deduplicate concurrent refresh attempts
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/auth/token/refresh/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          },
        );

        if (!response.ok) {
          this.clearTokens();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("startpilot_auth_unauthorized"));
          }
          return false;
        }

        const data = await response.json();
        this.setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken,
        });
        return true;
      } catch {
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("startpilot_auth_unauthorized"));
        }
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // ──────────────────────────────────────────────
  // Core Request Method
  // ──────────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      params?: Record<string, string>;
      authenticated?: boolean;
      formData?: boolean;
    } = {},
  ): Promise<T> {
    const { body, params, authenticated = true, formData = false } = options;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${API_BASE_URL}${cleanPath}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const headers: Record<string, string> = {};

    if (!formData) {
      headers["Content-Type"] = "application/json";
    }

    if (authenticated) {
      let token = this.getAccessToken();
      // If access token is missing but refresh token exists, try refreshing proactively
      if (!token && this.getRefreshToken()) {
        const refreshed = await this.attemptTokenRefresh();
        if (refreshed) {
          token = this.getAccessToken();
        }
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("startpilot_auth_unauthorized"));
        }
        throw new ApiError(401, {
          detail: "Authentication credentials were not provided.",
        });
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers,
        body: formData ? body : body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError: any) {
      throw new ApiError(0, {
        detail: `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running.`,
      });
    }

    // If 401, attempt token refresh and retry once
    if (response.status === 401 && authenticated && this.getRefreshToken()) {
      const refreshed = await this.attemptTokenRefresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getAccessToken()}`;
        try {
          response = await fetch(url.toString(), {
            method,
            headers,
            body: formData ? body : body ? JSON.stringify(body) : undefined,
          });
        } catch (networkError: any) {
          throw new ApiError(0, {
            detail: `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running.`,
          });
        }
      }
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = { detail: response.statusText || "Server returned non-JSON response." };
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("startpilot_auth_unauthorized"));
        }
      }
      throw new ApiError(response.status, data);
    }

    return data as T;
  }

  // ──────────────────────────────────────────────
  // HTTP Verb Shortcuts
  // ──────────────────────────────────────────────

  get<T>(
    path: string,
    params?: Record<string, string>,
    authenticated = true,
  ): Promise<T> {
    return this.request<T>("GET", path, { params, authenticated });
  }

  post<T>(
    path: string,
    body?: any,
    authenticated = true,
    formData = false,
  ): Promise<T> {
    return this.request<T>("POST", path, { body, authenticated, formData });
  }

  put<T>(
    path: string,
    body?: any,
    authenticated = true,
    formData = false,
  ): Promise<T> {
    return this.request<T>("PUT", path, { body, authenticated, formData });
  }

  patch<T>(
    path: string,
    body?: any,
    authenticated = true,
    formData = false,
  ): Promise<T> {
    return this.request<T>("PATCH", path, { body, authenticated, formData });
  }

  delete<T>(path: string, authenticated = true): Promise<T> {
    return this.request<T>("DELETE", path, { authenticated });
  }
}

export const apiClient = new ApiClient();
export type { TokenPair };

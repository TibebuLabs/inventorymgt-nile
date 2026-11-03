import axios, { AxiosInstance, AxiosResponse } from "axios";
import SharedPreferencesService from "./storage";

class HttpNetworkService {
  private baseUrl: string;
  private prefs: SharedPreferencesService;
  private client: AxiosInstance;

  constructor(prefs: SharedPreferencesService) {
    // Use VITE_ prefix for environment variables in Vite projects.
    const fromEnv = import.meta.env.VITE_API_BASE_URL;
    if (fromEnv) {
      this.baseUrl = fromEnv;
    } else if (import.meta.env.DEV) {
      this.baseUrl = "http://localhost:3000/";
    } else {
      // In production the env var must be set at build time; fall back to the
      // same origin and warn loudly so a misconfigured deploy is obvious.
      this.baseUrl = window.location.origin;
      console.error(
        "[network] VITE_API_BASE_URL is not set — falling back to " +
          window.location.origin +
          ". Set VITE_API_BASE_URL at build time for production.",
      );
    }
    this.prefs = prefs;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  private getHeaders(byPassToken = false): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=UTF-8",
    };
    if (!byPassToken) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private getAuthToken(): string | null {
    return this.prefs.getString("token");
  }

  public async get<T>(url: string, byPassToken = false): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, {
        headers: this.getHeaders(byPassToken),
      });
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(
    url: string,
    data: unknown,
    byPassToken = false
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, {
        headers: this.getHeaders(byPassToken),
      });
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Fixed: was calling this.client.put() — now correctly calls patch()
  public async patch<T>(
    url: string,
    data: unknown,
    byPassToken = false
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.patch(url, data, {
        headers: this.getHeaders(byPassToken),
      });
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<T>(
    url: string,
    data: unknown,
    byPassToken = false
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, {
        headers: this.getHeaders(byPassToken),
      });
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(url: string, byPassToken = false): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, {
        headers: this.getHeaders(byPassToken),
      });
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private processResponse<T>(response: AxiosResponse<T>): T {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    }
    throw new Error(
      `Request failed with status ${response.status}: ${JSON.stringify(response.data)}`
    );
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const message =
          data?.message ||
          (typeof data === "string" ? data : JSON.stringify(data));
        const url = (error.config?.url as string) || "";

        if (status === 401) {
          // An expired/invalid token in production should not leave the user
          // stuck in a half-authenticated state. Clear local credentials and
          // notify AuthContext (except while the login request itself fails).
          const isLogin = url.includes("auth/login");
          if (!isLogin && this.prefs.getString("token")) {
            this.prefs.remove("token").catch(() => undefined);
            this.prefs.remove("user").catch(() => undefined);
            window.dispatchEvent(new Event("auth:unauthorized"));
          }
          return new Error(`Unauthorized: ${message}`);
        }
        if (status === 403) return new Error(`Forbidden: ${message}`);
        if (status === 404) return new Error(`Not found: ${message}`);
        if (status === 409) return new Error(`Conflict: ${message}`);
        if (status === 400) return new Error(`Bad request: ${message}`);
        return new Error(`Server error (${status}): ${message}`);
      } else if (error.request) {
        return new Error(
          "Network error: Unable to reach the server. Please check your connection."
        );
      }
    }
    return new Error(`Unexpected error: ${String(error)}`);
  }
}

export default HttpNetworkService;

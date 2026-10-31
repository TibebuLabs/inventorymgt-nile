import axios, { AxiosInstance, AxiosResponse } from "axios";
import SharedPreferencesService from "./storage";

class HttpNetworkService {
  private baseUrl: string;
  private prefs: SharedPreferencesService;
  private client: AxiosInstance;

  constructor(prefs: SharedPreferencesService) {
    // Use VITE_ prefix for environment variables in Vite projects
    this.baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";
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

        if (status === 401) return new Error(`Unauthorized: ${message}`);
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

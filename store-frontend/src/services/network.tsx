import axios, { AxiosInstance, AxiosResponse } from "axios";
import SharedPreferencesService from "./storage";

class HttpNetworkService {
  private baseUrl: string;
  private prefs: SharedPreferencesService;
  private client: AxiosInstance;

  constructor(prefs: SharedPreferencesService) {
    this.baseUrl = "http://192.168.8.17:3000/";
    // process.env.REACT_APP_BASE_URL || "http://192.168.137.158:3000/";
    this.prefs = prefs;
    this.client = axios.create();
  }

  private getHeaders(byPassToken = false): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      "Content-Type": "application/json; charset=UTF-8",
    };
    if (!byPassToken) {
      headers["Authorization"] = `Bearer ${this.getAuthToken()}`;
    }
    return headers;
  }

  private getAuthToken(): string | null {
    return this.prefs.getString("token");
  }

  public async get<T>(url: string, byPassToken = false): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(
        this.baseUrl + url,
        {
          headers: this.getHeaders(byPassToken),
        }
      );
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(
    url: string,
    data: any,
    byPassToken = false
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(
        this.baseUrl + url,
        data,
        {
          headers: this.getHeaders(byPassToken),
        }
      );

      console.log(response);
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async patch<T>(
    url: string,
    data: any,
    byPassToken = true
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(
        this.baseUrl + url,
        data,
        {
          headers: this.getHeaders(byPassToken),
        }
      );
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(url: string, byPassToken = true): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(
        this.baseUrl + url,
        {
          headers: this.getHeaders(byPassToken),
        }
      );
      return this.processResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private processResponse<T>(response: AxiosResponse<T>): T {
    switch (response.status) {
      case 200:
      case 201:
        return response.data;
      case 400:
        throw new Error(`Bad request: ${response.data}`);
      case 401:
        throw new Error(`Unauthorized: ${response.data}`);
      case 404:
        throw new Error(`Not found: ${response.data}`);
      case 500:
        throw new Error(`Server error: ${response.data}`);
      default:
        throw new Error(
          `Unexpected error: ${response.status} - ${response.data}`
        );
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      return this.processResponse(error.response);
    } else if (error.request) {
      throw new Error("Network error: No response received.");
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default HttpNetworkService;

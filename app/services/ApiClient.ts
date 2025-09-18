import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import axiosRetry from "axios-retry";
import { getSession, commitSession } from "./session.server";
import { authenticator, type User } from "./auth.server";
import type { OAuth2Strategy } from "remix-auth-oauth2";

export class ApiClient {
  private session: Awaited<ReturnType<typeof getSession>>;
  private strategy: OAuth2Strategy<User> | null;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: (() => void)[] = [];

  constructor(
    session: Awaited<ReturnType<typeof getSession>>,
    baseUrl: string,
  ) {
    this.session = session;
    this.strategy = authenticator.get("cognito-auth");

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: { "Content-Type": "application/json" },
    });

    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error),
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      if (this.isTokenExpired()) {
        await this.refreshAccessToken();
      }
      const token = this.session.get("user")?.accessToken;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        } as any;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue up requests while refresh is happening
            return new Promise((resolve) => {
              this.refreshQueue.push(() => {
                resolve(this.axiosInstance(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshAccessToken();

            this.refreshQueue.forEach((cb) => cb());
            this.refreshQueue = [];

            return this.axiosInstance(originalRequest);
          } catch (refreshErr) {
            // If refresh fails, clear session (user must log in again)
            this.session.unset("user");
            throw refreshErr;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private isTokenExpired(): boolean {
    const expiry = this.session.get("user")?.tokenExpiresIn;
    return !expiry || Date.now() > expiry;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.strategy) {
      throw new Error("No authentication strategy available");
    }

    const user = this.session.get("user");
    if (!user) {
      throw new Error("Session user does not exist");
    }

    const refreshToken = user.refreshToken;
    if (!refreshToken) throw new Error("No refresh token available");

    const tokens = await this.strategy.refreshToken(refreshToken);

    user.accessToken = tokens.accessToken();
    user.tokenExpiresIn =
      Date.now() + tokens.accessTokenExpiresInSeconds() * 1000;

    this.session.set("user", user);
  }

  async request<T = any>(
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  async commit(): Promise<string> {
    return commitSession(this.session);
  }
}

import Axios, { AxiosError, AxiosRequestConfig } from "axios";

// Server code calls the API directly, browser goes through the same-origin `/api` rewrite (see next.config.ts)
// so the auth cookie stays first-party.
export const SERVER_API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";
export const BROWSER_API_URL = "/api";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: typeof window === "undefined" ? SERVER_API_URL : BROWSER_API_URL,
});

// Server requests don't carry the browser cookie - forward the auth cookie of the current request as a Bearer token.
// `cookies()` is request-scoped, so the shared instance is safe. Outside a request (build, static render) it throws.
if (typeof window === "undefined") {
  AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    if (config.headers.has("Authorization")) return config;
    try {
      const { cookies } = await import("next/headers");
      const token = (await cookies()).get("AuthCookie")?.value;
      if (token) config.headers.set("Authorization", `Bearer ${token}`);
    } catch {
      // No request scope - send unauthenticated
    }
    return config;
  });
}

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const { data } = await AXIOS_INSTANCE({
    ...config,
    ...options,
  });
  return data;
};

// export type ErrorType<Error> = AxiosError<Error>;

export type ErrorDataType = {
  statusCode: number;
  error: string;
  message?: string | string[];
  [key: string]: any;
};

export type ErrorType<Error = ErrorDataType> = AxiosError<Error & ErrorDataType>;

// export type BodyType<BodyData> = BodyData;

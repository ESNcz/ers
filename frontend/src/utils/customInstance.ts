import Axios, { AxiosError, AxiosRequestConfig } from "axios";

// Server code calls the API directly, browser goes through the same-origin `/api` rewrite (see next.config.ts)
// so the auth cookie stays first-party.
export const SERVER_API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";
export const BROWSER_API_URL = "/api";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: typeof window === "undefined" ? SERVER_API_URL : BROWSER_API_URL,
});

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

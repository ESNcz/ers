import Axios, { AxiosError, AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({ baseURL: process.env.NEXT_PUBLIC_API_DOMAIN, withCredentials: true });

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const { data } = await AXIOS_INSTANCE({
    ...config,
    ...options,
    withCredentials: true,
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

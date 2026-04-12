import Axios, { AxiosError, AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({ withCredentials: true });

export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const { data } = await AXIOS_INSTANCE({
    ...config,
    ...options,
    baseURL: process.env.NEXT_PUBLIC_API_DOMAIN,
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

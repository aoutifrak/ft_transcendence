import { RootState } from "@/src/states/store";
import { axiosPrivate } from "../api/axios";
import refreshToken from "./refreshToken";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const pendingRequests = new Map();
const getRequestKey = (config: AxiosRequestConfig): string => {
  if (config.params)
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}`
  return `${config.method}:${config.url}`;
}
const addPendingRequest  = (config : InternalAxiosRequestConfig) => {
  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)){
    const controller = pendingRequests.get(requestKey);
    controller.abort();
    pendingRequests.delete(requestKey);
  }
  const controller : AbortController = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);
}
const removePendingRequest = (config: InternalAxiosRequestConfig) => {
  const requestKey = getRequestKey(config);
  pendingRequests.delete(requestKey);
}

const useAxiosPrivate = () => {
  const accessToken = useSelector(
    (state: RootState) => state.accessToken.value
  );
  const refresh = refreshToken();
  useEffect(() => {


    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        addPendingRequest(config)
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosPrivate.interceptors.response.use(
      (response) => {
        removePendingRequest(response.config)
        return response
      },
      async (error) => {
        const prevRequest = error?.config;
        if (error.config)
          removePendingRequest(error.config)
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
      axiosPrivate.interceptors.request.eject(responseInterceptor);
    };
  }, [accessToken, refresh]);

  return axiosPrivate;
};

export {useAxiosPrivate};

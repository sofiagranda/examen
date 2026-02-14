import axios from "axios";
import { getAuthToken } from "./token";

export const http = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Token ${token}`;
  }
  return config;
});
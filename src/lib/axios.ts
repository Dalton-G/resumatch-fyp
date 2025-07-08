import axios from "axios";
import { env } from "@/config/env";

const axiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_APP_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;

import axios from "axios";

/* 
  Note:
  won't be using env.ts file here because secrets are not allowed on client components
*/

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;

if (!APP_BASE_URL) {
  throw new Error("NEXT_PUBLIC_APP_BASE_URL is not set");
}

const axiosInstance = axios.create({
  baseURL: APP_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;

import axios from "axios";

const axiosAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosAuth.interceptors.request.use(async (config) => {
  // const session = await getSession();
  // if (session?.accessToken) {
  //   config.headers = {
  //     ...config.headers,
  //     Authorization: `Bearer ${session.accessToken}`,
  //   };
  // }
  return config;
});

export default axiosAuth;

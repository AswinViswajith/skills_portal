import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle token verification errors
axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses
  (error) => {
    if (error.response?.status === 401) {
      // If token is invalid, clear localStorage and redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login"; // Adjust the path to your login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from "axios";

const adminAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

adminAxios.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    console.log(">>Error:", error);
    return Promise.reject(error);
  }
);

export default adminAxios;

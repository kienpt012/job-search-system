import axios from "axios";
// import queryString from 'query-string';

const employerAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
  // paramsSerializer: params => queryString.stringify(params),
});

employerAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employer_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

employerAxios.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    console.log('>>Error:', error);
    return Promise.reject(error);
  }
);

export default employerAxios;

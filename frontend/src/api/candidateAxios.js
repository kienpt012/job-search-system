import axios from "axios";
// import queryString from 'query-string';

const candidateAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL + '/api',
  // paramsSerializer: params => queryString.stringify(params),
});

candidateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('candidate_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

candidateAxios.interceptors.response.use(
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

export default candidateAxios;

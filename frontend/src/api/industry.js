import commonAxios from "./commonAxios";

const prefix = "/industries";
const industryApi = {
  getAll: () => {
    return commonAxios.get(`${prefix}`);
  },
}

export default industryApi;
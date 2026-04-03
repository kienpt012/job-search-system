import commonAxios from "./commonAxios";

const prefix = "/locations";
const locationApi = {
  getAll: () => {
    return commonAxios.get(`${prefix}`);
  },
}

export default locationApi;
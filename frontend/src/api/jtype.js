import commonAxios from "./commonAxios";

const prefix = "/jtypes";
const jtypeApi = {
  getAll: () => {
    return commonAxios.get(`${prefix}`);
  },
}

export default jtypeApi;

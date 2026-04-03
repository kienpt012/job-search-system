import commonAxios from "./commonAxios";

const prefix = "/jlevels";
const jlevelApi = {
  getAll: () => {
    return commonAxios.get(`${prefix}`);
  },
}

export default jlevelApi;

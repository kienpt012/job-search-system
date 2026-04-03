import candidateAxios from "./candidateAxios";
import commonAxios from "./commonAxios";
import employerAxios from "./employerAxios";
import queryString from "query-string";

const prefix = "/jobs";
const jobApi = {
  getList: (params) => {
    return commonAxios.get(
      `${prefix}?${queryString.stringify(params, { arrayFormat: "index" })}`
    );
  },
  getById: (id) => {
    return commonAxios.get(`${prefix}/${id}/getByID`);
  },
  getHotList: () => {
    return commonAxios.get(`${prefix}/getHotList`);
  },
  create: (data) => {
    return employerAxios.post(`${prefix}`, data);
  },
  update: (id, data) => {
    return employerAxios.post(`${prefix}/${id}/update`, data);
  },
  getJobIndustries: (id) => {
    return commonAxios.get(`${prefix}/${id}/getJobIndustries`);
  },
  filter: (data) => {
    return commonAxios.post(`${prefix}/filter`, data);
  },
  apply: (id, formData) => {
    return candidateAxios.post(`${prefix}/${id}/apply`, formData);
  },
  checkApplying: (id) => {
    return candidateAxios.get(`${prefix}/${id}/checkApplying`);
  },
};

export default jobApi;

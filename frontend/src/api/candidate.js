import candidateAxios from "./candidateAxios";

const prefix = "/candidates";
const candidateApi = {
  getById: (id) => {
    return candidateAxios.get(`${prefix}/${id}`);
  },
  update: (data) => {
    return candidateAxios.post(`${prefix}/update`, data);
  },
  getCurrent: () => {
    return candidateAxios.get(`${prefix}/getCurrent`);
  },
  getDashboardSummary: () => {
    return candidateAxios.get(`${prefix}/dashboardSummary`);
  },
  getProfileBundle: () => {
    return candidateAxios.get(`${prefix}/profileBundle`);
  },
  getNearbyCompanies: () => {
    return candidateAxios.get(`${prefix}/nearbyCompanies`);
  },
  resolveSharedMapLink: (params) => {
    return candidateAxios.post(`${prefix}/resolveSharedMapLink`, params);
  },
  getAppliedJobs: (id) => {
    return candidateAxios.get(`${prefix}/${id}/getAppliedJobs`);
  },
  getSavedJobs: (id) => {
    return candidateAxios.get(`${prefix}/${id}/getSavedJobs`);
  },
  processJobSaving: (job_id, data) => {
    return candidateAxios.post(`${prefix}/${job_id}/processJobSaving`, data);
  },
  checkJobSaved: (job_id) => {
    return candidateAxios.get(`${prefix}/${job_id}/checkJobSaved`);
  },
};

export default candidateApi;

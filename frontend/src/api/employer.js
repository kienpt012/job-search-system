import commonAxios from "./commonAxios";
import employerAxios from "./employerAxios";
import queryString from "query-string";

const prefix = "/companies";
const employerApi = {
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
  getDashboard: () => {
    return employerAxios.get(`${prefix}/dashboard`);
  },
  getMe: () => {
    return employerAxios.get("/employer/me");
  },
  getBranches: () => {
    return employerAxios.get("/employer/branches");
  },
  createBranch: (data) => {
    return employerAxios.post("/employer/branches", data);
  },
  updateBranch: (id, data) => {
    return employerAxios.patch(`/employer/branches/${id}`, data);
  },
  deleteBranch: (id) => {
    return employerAxios.delete(`/employer/branches/${id}`);
  },
  getMembers: () => {
    return employerAxios.get("/employer/members");
  },
  createMember: (data) => {
    return employerAxios.post("/employer/members", data);
  },
  updateMember: (id, data) => {
    return employerAxios.patch(`/employer/members/${id}`, data);
  },
  deleteMember: (id) => {
    return employerAxios.delete(`/employer/members/${id}`);
  },
  updateCurrent: (formData) => {
    return employerAxios.post(`${prefix}/updateCurrent`, formData);
  },
  resolveSharedMapLink: (params) => {
    return employerAxios.post(`${prefix}/resolveSharedMapLink`, params);
  },
  // destroy: (id) => {
  //   return commonAxios.delete(`${prefix}/${id}/destroy`);
  // },
  search: (keyword) => {
    return commonAxios.get(`${prefix}?keyword=${keyword}`);
  },
  getComJobs: (id) => {
    return commonAxios.get(`${prefix}/${id}/getComJobs`);
  },
  getJobList: (id, keyword, params = {}) => {
    const query = queryString.stringify(
      { keyword: keyword || "", ...params },
      { arrayFormat: "index" }
    );
    return employerAxios.get(`/employer/jobs?${query}`);
  },
  getCandidateList: (keyword, status, params = {}) => {
    const query = queryString.stringify(
      { keyword: keyword || "", status: status || "", ...params },
      { arrayFormat: "index" }
    );
    let url = `${prefix}/getCandidateList?${query}`;
    return employerAxios.get(url);
  },
  searchCandidates: (params) => {
    return employerAxios.get(
      `${prefix}/searchCandidates?${queryString.stringify(params, { arrayFormat: "index" })}`
    );
  },
  getTalentRecommendations: () => {
    return employerAxios.get(`${prefix}/talentRecommendations`);
  },
  getRecommendedCandidates: (jobId) => {
    return employerAxios.get(`${prefix}/jobs/${jobId}/recommendedCandidates`);
  },
  contactCandidate: (data) => {
    return employerAxios.post(`${prefix}/contactCandidate`, data);
  },
  processApplying: (data) => {
    return employerAxios.post(`${prefix}/processApplying`, data);
  },
  changeJobStatus: (job_id, data) => {
    return employerAxios.post(`${prefix}/${job_id}/changeJobStatus`, data);
  },
  deleteJob: (id) => {
    return employerAxios.delete(`/jobs/${id}`);
  },
};
export default employerApi;

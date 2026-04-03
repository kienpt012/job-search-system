import candidateAxios from "./candidateAxios";

const prefix = "/projects";
const projectApi = {
  getByCurrentCandidateProfile: () => {
    return candidateAxios.get(`${prefix}/getByCurrentCandidateProfile`);
  },
  create: (data) => {
    return candidateAxios.post(`${prefix}`, data);
  },
  destroy: (id) => {
    return candidateAxios.delete(`${prefix}/${id}`);
  },  
  update: (id, data) => {
    return candidateAxios.patch(`${prefix}/${id}`, data);
  },
}

export default projectApi;
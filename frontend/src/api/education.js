import candidateAxios from "./candidateAxios";

const prefix = "/educations";
const educationApi = {
  getAll: () => {
    return candidateAxios.get(`${prefix}`);
  },
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
    return candidateAxios.post(`${prefix}/update/${id}`, data);
  },
}

export default educationApi;
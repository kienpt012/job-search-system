import candidateAxios from "./candidateAxios";

const prefix = "/certificates";
const certificateApi = {
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

export default certificateApi;
import candidateAxios from "./candidateAxios";

const prefix = '/cand-msgs'
const candMsgApi = {
  getMsgs: (candidateId) => {
    return candidateAxios.get(`${prefix}/${candidateId}/getByCandidateID`);
  },
  markAsRead: (msgId) => {
    return candidateAxios.get(`${prefix}/${msgId}/updateReadMsg`);
  },
};

export default candMsgApi;

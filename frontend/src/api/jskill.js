import adminAxios from "./adminAxios";
import commonAxios from "./commonAxios";

const prefix = "/jskills";

const jskillApi = {
  getAll: () => commonAxios.get(prefix),
  create: (data) => adminAxios.post(prefix, data),
  update: (id, data) => adminAxios.patch(`${prefix}/${id}`, data),
  destroy: (id) => adminAxios.delete(`${prefix}/${id}`),
};

export default jskillApi;

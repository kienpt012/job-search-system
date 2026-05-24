import adminAxios from "./adminAxios";

const adminApi = {
  getDashboard: () => adminAxios.get("/admin/dashboard"),
  getHeroSlides: () => adminAxios.get("/admin/hero-slides"),
  createHeroSlide: (params) => adminAxios.post("/admin/hero-slides", params),
  reorderHeroSlides: (params) => adminAxios.post("/admin/hero-slides/reorder", params),
  updateHeroSlideStatus: (id, params) =>
    adminAxios.post(`/admin/hero-slides/${id}/status`, params),
  deleteHeroSlide: (id) => adminAxios.delete(`/admin/hero-slides/${id}`),
  getSkills: () => adminAxios.get("/jskills"),
  createSkill: (params) => adminAxios.post("/jskills", params),
  updateSkill: (id, params) => adminAxios.patch(`/jskills/${id}`, params),
  deleteSkill: (id) => adminAxios.delete(`/jskills/${id}`),
  resolveSharedMapLink: (params) => adminAxios.post("/admin/resolveSharedMapLink", params),
  getJobs: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.company_id) {
      searchParams.set("company_id", params.company_id);
    }
    if (params.keyword) {
      searchParams.set("keyword", params.keyword);
    }

    const query = searchParams.toString();
    return adminAxios.get(`/admin/jobs${query ? `?${query}` : ""}`);
  },
  updateJob: (id, params) => adminAxios.post(`/admin/jobs/${id}/update`, params),
  createCompany: (params) => adminAxios.post("/admin/companies", params),
  updateCompany: (id, params) => adminAxios.post(`/admin/companies/${id}/update`, params),
  deleteCompany: (id) => adminAxios.delete(`/admin/companies/${id}`),
  updateUserStatus: (id, params) => adminAxios.post(`/admin/users/${id}/status`, params),
  updateUserPassword: (id, params) => adminAxios.post(`/admin/users/${id}/password`, params),
  deleteUser: (id) => adminAxios.delete(`/admin/users/${id}`),
  getEmployerRegistrations: () => adminAxios.get("/employer-registrations"),
  approveEmployerRegistration: (id, params = {}) =>
    adminAxios.post(`/employer-registrations/${id}/approve`, params),
  rejectEmployerRegistration: (id, params = {}) =>
    adminAxios.post(`/employer-registrations/${id}/reject`, params),
};

export default adminApi;

import employerAxios from "./employerAxios";

const prefix = "/employer/billing";

const billingApi = {
  getSummary: () => employerAxios.get(`${prefix}/summary`),
  createCheckout: (planKey) => employerAxios.post(`${prefix}/checkout`, { plan_key: planKey }),
  syncPayment: (orderCode) => employerAxios.post(`${prefix}/payments/${orderCode}/sync`),
};

export default billingApi;

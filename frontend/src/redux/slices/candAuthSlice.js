import { createSlice } from "@reduxjs/toolkit";

const createEmptyCandidate = () => ({
  id: null,
  user_id: null,
  firstname: "",
  lastname: "",
  email: "",
  avatar: "",
  address: "",
  phone: "",
  gender: null,
  dob: "",
  link: "",
  objective: "",
  map_lat: null,
  map_lng: null,
});

const normalizeCandidate = (payload) => {
  const source = payload || {};
  const legacyName = source?.name || {};

  return {
    ...createEmptyCandidate(),
    ...source,
    id: source?.id ?? source?.user_id ?? null,
    user_id: source?.user_id ?? source?.id ?? null,
    firstname: source?.firstname ?? legacyName?.firstname ?? "",
    lastname: source?.lastname ?? legacyName?.lastname ?? "",
    email: source?.email ?? "",
    avatar: source?.avatar ?? "",
    address: source?.address ?? "",
    phone: source?.phone ?? "",
    gender: source?.gender ?? null,
    dob: source?.dob ?? "",
    link: source?.link ?? "",
    objective: source?.objective ?? "",
    map_lat: source?.map_lat ?? null,
    map_lng: source?.map_lng ?? null,
  };
};

const candAuthSlice = createSlice({
  name: "candAuth",
  initialState: {
    current: createEmptyCandidate(),
    isAuth: false,
  },
  reducers: {
    setCurrentCandidate: (state, action) => {
      state.current = normalizeCandidate(action.payload);
      state.isAuth = true;
    },
    logout: (state) => {
      state.current = createEmptyCandidate();
      state.isAuth = false;
    },
  },
});

const { reducer: candAuthReducer, actions: candAuthActions } = candAuthSlice;
export { candAuthActions };
export default candAuthReducer;

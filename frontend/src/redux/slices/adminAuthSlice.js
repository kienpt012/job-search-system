import { createSlice } from "@reduxjs/toolkit";

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    current: {},
    isAuth: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.current = action.payload;
      state.isAuth = true;
    },
    logout: (state) => {
      state.current = {};
      state.isAuth = false;
    },
  },
});

const { reducer: adminAuthReducer, actions: adminAuthActions } = adminAuthSlice;

export { adminAuthActions };
export default adminAuthReducer;

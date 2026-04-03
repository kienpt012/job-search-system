import { createSlice } from "@reduxjs/toolkit";

const employerAuthSlice = createSlice({
  name: "employerAuth",
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

const { reducer: employerAuthReducer, actions: employerAuthActions } = employerAuthSlice;
export { employerAuthActions };
export default employerAuthReducer;

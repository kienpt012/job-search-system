import adminAuthReducer from "./slices/adminAuthSlice";
import { configureStore } from "@reduxjs/toolkit";
import candAuthReducer from "./slices/candAuthSlice";
import employerAuthReducer from "./slices/employerAuthSlice";

const rootReducer = {
    adminAuth: adminAuthReducer,
    candAuth: candAuthReducer,
    employerAuth: employerAuthReducer,
}
const store = configureStore({
    reducer: rootReducer,
});

export default store;

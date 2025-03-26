import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/users/user.slice";
import drugReducer from "./features/drugs/drug.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    drug: drugReducer,
  },
});

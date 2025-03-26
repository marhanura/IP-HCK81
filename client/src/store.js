import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/users/user.slice";
import drugReducer from "./features/drugs/drug.slice";
import diseaseReducer from "./features/diseases/disease.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    drug: drugReducer,
    disease: diseaseReducer,
  },
});

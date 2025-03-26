import {
  buildCreateSlice,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "../../helpers/api";

const drugSlice = createSlice({
  name: "drug",
  initialState: {
    drugs: [],
  },
  reducers: {
    setDrugs: (state, action) => {
      state.drugs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDrugs.fulfilled, (state, action) => {
      state.drugs = action.payload;
    });
    builder.addCase(fetchDrugs.rejected, (state, action) => {
      console.error("Error fetching drugs:", action.error.message);
      console.error("Error adding drug", action.error.message);
    });
  },
});

export const { setDrugs } = drugSlice.actions;

export const fetchDrugs = createAsyncThunk("drug/fetchDrugs", async () => {
  const response = await api.get("/drugs", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  console.log("🐄 - fetchDrugs - response:", response);
  return response.data;
});

export default drugSlice.reducer;

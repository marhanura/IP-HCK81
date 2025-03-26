import {
  buildCreateSlice,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "../../helpers/api";
import Swal from "sweetalert2";

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
  try {
    const response = await api.get("/drugs");
    return response.data;
  } catch (error) {
    console.log("🐄 - fetchDrugs - error:", error);
    Swal.fire({ text: error.response.data.message, icon: "error" });
  }
});

export default drugSlice.reducer;

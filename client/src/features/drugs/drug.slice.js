import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../helpers/api";
import Swal from "sweetalert2";

const drugSlice = createSlice({
  name: "drug",
  initialState: {
    drugs: [],
    currentPage: 1,
    totalPages: 0,
  },
  reducers: {
    setDrugs: (state, action) => {
      state.drugs = action.payload;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDrugs.fulfilled, (state, action) => {
      state.drugs = action.payload;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchDrugs.rejected, (state, action) => {
      console.error("Error fetching drugs:", action.error.message);
      console.error("Error adding drug", action.error.message);
    });
  },
});

export const { setDrugs } = drugSlice.actions;

export const fetchDrugs = createAsyncThunk(
  "drug/fetchDrugs",
  async ({ search, page }) => {
    try {
      const response = await api.get(
        `/drugs?search=${search}&page[number]=${page}`
      );
      return response.data;
    } catch (error) {
      console.log("🐄 - fetchDrugs - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export const fetchDrugById = createAsyncThunk(
  "drug/fetchDrugById",
  async (drugId) => {
    try {
      const response = await api.get(`/drugs/${drugId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.log("🐄 - fetchDrugById - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export default drugSlice.reducer;

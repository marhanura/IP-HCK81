import {
  buildCreateSlice,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "../../helpers/api";
import Swal from "sweetalert2";
import axios from "axios";

const diseaseSlice = createSlice({
  name: "disease",
  initialState: {
    diseases: [],
  },
  reducers: {
    setDiseases: (state, action) => {
      state.diseases = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDiseases.fulfilled, (state, action) => {
      state.diseases = action.payload;
    });
    builder.addCase(fetchDiseaseByUser.fulfilled, (state, action) => {
      state.diseases = action.payload;
    });
    builder.addCase(fetchDiseases.rejected, (state, action) => {
      console.error("Error fetching diseases:", action.error.message);
    });
    builder.addCase(fetchDiseaseByUser.rejected, (state, action) => {
      console.error("Error fetching disease by user:", action.error.message);
    });
  },
});

export const { setDiseases } = diseaseSlice.actions;

export const fetchDiseases = createAsyncThunk(
  "disease/fetchDiseases",
  async () => {
    try {
      const response = await api.get("/diseases", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("🐄 - fetchDiseases - response:", response);
      return response.data;
    } catch (error) {
      console.log("🐄 - fetchDiseases - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export const fetchDiseaseById = createAsyncThunk(
  "disease/fetchDiseaseById",
  async (diseaseId) => {
    try {
      const response = await api.get(`/diseases/${diseaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response;
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export const fetchDiseaseByUser = createAsyncThunk(
  "disease/fetchDiseaseByUser",
  async (userId) => {
    try {
      const response = await api.get(`/diseases/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response;
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export const addDisease = createAsyncThunk(
  "disease/addDisease",
  async (userId, symptoms) => {
    try {
      const response = await api.post(`/diseases/users/${userId}`, symptoms, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response;
    } catch (error) {
      console.log("🐄 - addDisease - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }
);

export default diseaseSlice.reducer;

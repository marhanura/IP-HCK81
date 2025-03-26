import {
  buildCreateSlice,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { api } from "../../helpers/api";
import Swal from "sweetalert2";

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
    builder.addCase(fetchDiseases.rejected, (state, action) => {
      console.error("Error fetching diseases:", action.error.message);
      console.error("Error adding disease", action.error.message);
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

export default diseaseSlice.reducer;

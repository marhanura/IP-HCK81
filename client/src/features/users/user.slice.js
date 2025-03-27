import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../helpers/api";

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      console.error("Error fetching users:", action.error.message);
      console.error("Error adding user", action.error.message);
    });
  },
});

export const { setUsers } = userSlice.actions;

export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  const response = await api.get("/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
  console.log("🐄 - fetchUsers - response:", response);
  return response;
});

export default userSlice.reducer;

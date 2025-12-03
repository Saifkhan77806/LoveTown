import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { userType } from "../types";
import { setStatus } from "./statusSlice";

interface initialStateType {
  user: null | userType;
  error: boolean;
  loading: boolean;
}

const initialState: initialStateType = {
  user: null,
  error: false,
  loading: false,
};

const fetchUser = async ({
  email,
  isEmbedding,
}: {
  email: string;
  isEmbedding?: boolean;
}) => {
  try {
    const response = await api.get("/user/getuser", {
      params: { email, isEmbedding },
    });

    return response.data?.user;
  } catch (error) {
    console.error("user fetching error", error);
    return error;
  }
};

export const fetchUserAsync = createAsyncThunk(
  "user/data",
  async ({ email, isEmbedding }: { email: string; isEmbedding?: boolean }) => {
    return await fetchUser({ email, isEmbedding });
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAsync.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserAsync.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
  reducers: {},
});

export default userSlice.reducer;

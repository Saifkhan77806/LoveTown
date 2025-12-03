import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type initialStateType = {
  status: string | null;
  error: string | null;
  loading: boolean;
};

const initialState: initialStateType = {
  status: null,
  error: null,
  loading: false,
};

const fetchStatus = () => {
  let status = "available";
  return status;
};

export const fetchStatusAsync = createAsyncThunk("user/status", fetchStatus);

const statusSlice = createSlice({
  name: "status",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(fetchStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });
  },
  reducers: {},
});

export default statusSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toast: "",
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    setToast(state, action) {
      state.toast = action.payload;
    },
  },
});

export const { setToast } = toastSlice.actions;

export default toastSlice.reducer;

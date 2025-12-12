import { configureStore } from "@reduxjs/toolkit";
import statusSlice from "../slice/statusSlice";
import userSlice from "../slice/userSlice";
import matchedSlice from "../slice/matchedSlice";
import toastSlice from "../slice/toastSlice";

export const store = configureStore({
  reducer: {
    status: statusSlice,
    user: userSlice,
    matched: matchedSlice,
    toast: toastSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

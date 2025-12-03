import { configureStore } from "@reduxjs/toolkit";
import statusSlice from "../slice/statusSlice";
import userSlice from "../slice/userSlice";

export const store = configureStore({
  reducer: {
    status: statusSlice,
    user: userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

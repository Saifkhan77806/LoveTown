import { configureStore } from "@reduxjs/toolkit";
import statusSlice from "../slice/statusSlice";

export const store = configureStore({
  reducer: {
    status: statusSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

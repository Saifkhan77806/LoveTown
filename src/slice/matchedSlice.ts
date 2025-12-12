// matchedSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { getErrorMessage } from "../utils/axiosError";

export interface MatchedUser {
  name: string;
  age: number;
  email: string;
  bio: string;
  mood: string;
  interest: string[];
  values: string[];
  photos: string; // URL string
  personalityType: string;
  relationshipGoals: string;
  location: string;
  compatibilityScore: number;
}

// State shape
interface InitialStateType {
  matchedUser: MatchedUser | null;
  error: string | null;
  loading: boolean;
}

const initialState: InitialStateType = {
  matchedUser: null,
  error: null,
  loading: false,
};

// CreateAsyncThunk with proper generics:
// <ReturnType, ThunkArg, ThunkApiConfig>
// We set rejectValue to string so we can pass a string with rejectWithValue.
export const fetchMatchedUserasync = createAsyncThunk<
  MatchedUser, // fulfilled return type
  string, // argument type (email)
  { rejectValue: string } // thunkAPI.rejectWithValue type
>("matched/user", async (email: string, { rejectWithValue }) => {
  try {
    const response = await api.get<MatchedUser>("matched/getmatcheduser", {
      params: { email },
    });

    // Ensure server returned the expected shape. If not, throw to be caught below.
    return response.data;
  } catch (err: unknown) {
    // Convert unknown error to a string message using your helper
    const message = getErrorMessage(err);
    // Return a rejected action with a typed payload (string)
    return rejectWithValue(message);
  }
});

const matchedSlice = createSlice({
  name: "matchedUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchedUserasync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.matchedUser = null;
      })
      .addCase(fetchMatchedUserasync.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedUser = action.payload; // action.payload is MatchedUser
        state.error = null;
      })
      .addCase(fetchMatchedUserasync.rejected, (state, action) => {
        state.loading = false;

        // action.payload is the value passed to rejectWithValue if used (typed as string)
        // action.error is a SerializedError and may contain .message
        state.error =
          action.payload ?? action.error?.message ?? "Something went wrong";
        // keep matchedUser as null on error
        state.matchedUser = null;
      });
  },
});

export default matchedSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user:null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setUser(state, value) {
      state.user = value.payload;
    },
  },
});

export const {  setUser, setLoading, setSignupData } = profileSlice.actions;

export default profileSlice.reducer;
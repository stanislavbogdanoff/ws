import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState: initialState,
  reducers: {
    loginUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return (state.user = action.payload);
    },
    registerUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return (state.user = action.payload);
    },
    logoutUser: (state) => {
      localStorage.removeItem("user");
      return (state.user = null);
    },
  },
});

export const { loginUser, registerUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;

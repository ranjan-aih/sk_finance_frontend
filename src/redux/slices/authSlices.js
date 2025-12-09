import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',

  // State will be populated by verifying cookie on app load
  initialState: {
    admin: null, // User data object
    isLoggedIn: false, // Boolean: true if user exists
    loading: false, // For showing loading states
    error: null, // For storing error messages
    isInitialized: false, // To track if we've checked auth status
  },

  reducers: {
    // Called when login/verify API is called
    authStart(state) {
      state.loading = true;
      state.error = null;
    },

    // Called when login is successful
    loginSuccess(state, action) {
      state.admin = action.payload; // Store user data in Redux only
      state.isLoggedIn = true; // Mark as logged in
      state.loading = false; // Stop loading
      state.error = null; // Clear any errors
      state.isInitialized = true; // Mark as initialized

      // NO localStorage - cookie handles persistence
    },

    // Called when login fails
    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload; // Store error message
      state.isInitialized = true; // Mark as initialized even on failure
    },

    // Called when user logs out
    logOut(state) {
      state.admin = null;
      state.isLoggedIn = false;
      state.error = null;
      state.isInitialized = true;

      // NO localStorage to clear - backend will clear cookie
    },

    // Clear error messages
    clearError(state) {
      state.error = null;
    },

    // Mark initialization complete (after verifying cookie)
    setInitialized(state) {
      state.isInitialized = true;
    },
  },
});

// Export actions
export const {
  authStart,
  loginSuccess,
  authFailure,
  logOut,
  clearError,
  setInitialized,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

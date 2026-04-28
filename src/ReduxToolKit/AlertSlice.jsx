import { createSlice } from '@reduxjs/toolkit';

const AlertSlice = createSlice({
  name: 'alert',
  initialState: { isVisible: false }, // Initial state for the alert
  reducers: {
    showAlert: (state) => {
      state.isVisible = true;
    },
    hideAlert: (state) => {
      state.isVisible = false;
    },
  },
});

export const { showAlert, hideAlert } = AlertSlice.actions; // Export actions for dispatch
export default AlertSlice.reducer;

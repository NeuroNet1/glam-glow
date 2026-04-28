import {configureStore} from '@reduxjs/toolkit';
import AddCartReducer from './AddCartSlice.js';
import AlertSlice from './AlertSlice.jsx';

export const store = configureStore({
  reducer: {
    cartItem: AddCartReducer,
    alert: AlertSlice,
  },
});
export default store;

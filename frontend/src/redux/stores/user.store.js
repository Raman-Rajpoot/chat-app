import { configureStore } from '@reduxjs/toolkit';
import LoginReducer from '../features/user.feature.js'; // Import your reducer

export const LoginStore = configureStore({
  reducer: {
    userData: LoginReducer,
  },
});

export default LoginStore;

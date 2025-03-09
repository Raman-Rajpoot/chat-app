import { configureStore } from '@reduxjs/toolkit';

export const LoginStore = configureStore({
  reducer: {
    userData: FriendReducer,
  },
});

export default LoginStore;

import { configureStore } from '@reduxjs/toolkit';
import loginReducer from '../features/user.feature.js'
import friendReducer from '../features/friend.feature.js'
export const rootStore = configureStore({
  reducer: {
    userData: loginReducer,
    friendData: friendReducer,
  },
});
export default rootStore;

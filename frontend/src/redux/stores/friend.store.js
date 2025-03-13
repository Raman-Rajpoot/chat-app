import { configureStore } from '@reduxjs/toolkit';
import FriendReducer from '../features/friend.feature.js';
export const friendStore = configureStore({
  reducer: {
    friendData: FriendReducer,
  },
});

export default friendStore;

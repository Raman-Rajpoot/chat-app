import { createSlice } from '@reduxjs/toolkit';

const FriendSlice = createSlice({
  name: 'FriendData',
  initialState: [], 
  reducers: {
    updateFriendData(state, action) {
      console.log(action, action.payload);
      return  action.payload; 
    }
  },
});

export const { updateFriendData } = FriendSlice.actions;
export default FriendSlice.reducer;

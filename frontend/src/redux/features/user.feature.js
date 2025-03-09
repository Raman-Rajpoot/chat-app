import { createSlice } from '@reduxjs/toolkit'

const LoginSlice = createSlice({
  name: 'UserData',
  initialState: {},
  reducers: {
    updateData(state , action) {
      
      return action.payload; 

    }
  },
})

export const { updateData } = LoginSlice.actions
export default LoginSlice.reducer
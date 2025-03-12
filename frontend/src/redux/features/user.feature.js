import { createSlice } from '@reduxjs/toolkit'

const LoginSlice = createSlice({
  name: 'UserData',
  initialState: {},
  reducers: {
    updateData(state , action) {
      console.log(action.payload)
      return action.payload; 

    }
  },
})

export const { updateData } = LoginSlice.actions
export default LoginSlice.reducer
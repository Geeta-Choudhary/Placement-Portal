import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    headerTitle: "Dashboard",
}

export const headerSlice = createSlice({
  name: 'header-title',
  initialState,
  reducers: {
    setHeaderTitle: (state, action) => {
      state.headerTitle = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setHeaderTitle } = headerSlice.actions

export default headerSlice.reducer
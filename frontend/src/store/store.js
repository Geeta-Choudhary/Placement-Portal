import { configureStore } from '@reduxjs/toolkit'
import headerTitleReducer from './headerSlice'
export const store = configureStore({
  reducer: {
    headerTitle: headerTitleReducer,
  },
})
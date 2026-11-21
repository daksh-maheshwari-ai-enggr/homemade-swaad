import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './authSlice';
import { foodApi } from './store';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [foodApi.reducerPath]: foodApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(foodApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { foodApi } from './apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [foodApi.reducerPath]: foodApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(foodApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export API hooks
export { 
  useGetMenuQuery,
  useCreateMenuItemMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useLoginWithPasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} from './apiSlice';

export { setCredentials, updateUser, logout } from './authSlice';
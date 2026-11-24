import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import type { AuthUser, MenuItem, Order } from '@food-delivery/types';

// Get API URL from env
const API_URL = (import.meta as unknown as Record<string, string>).VITE_API_URL || 'http://localhost:4000';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Base API with RTK Query
export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Menu', 'Orders', 'User'],
  endpoints: (builder) => ({
    // Menu endpoints
    getMenu: builder.query<MenuItem[], void>({
      query: () => '/menu',
      providesTags: ['Menu'],
    }),

    createMenuItem: builder.mutation<MenuItem, Partial<MenuItem>>({
      query: (body) => ({
        url: '/menu',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Menu'],
    }),

    // Order endpoints
    createOrder: builder.mutation<Order, { items: Array<{ menuItemId: number; quantity: number }> }>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
    }),

    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),

    // Auth endpoints
    sendOTP: builder.mutation<
      MessageResponse,
      { email: string; phone?: string; name?: string; password?: string }
    >({
      query: (body) => ({
        url: '/auth/otp',
        method: 'POST',
        body,
      }),
    }),

    verifyOTP: builder.mutation<AuthResponse, { email: string; phone?: string; code: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    loginWithPassword: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    // Password reset
    requestPasswordReset: builder.mutation<MessageResponse, { email: string }>({
      query: (body) => ({
        url: '/auth/password-reset',
        method: 'POST',
        body,
      }),
    }),

    confirmPasswordReset: builder.mutation<
      MessageResponse,
      { email: string; code: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/auth/password-reset/confirm',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetMenuQuery,
  useCreateMenuItemMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useLoginWithPasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
} = foodApi;

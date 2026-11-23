import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import type { MenuItem, Order, User } from '@food-delivery/types';

// Get API URL from env
const API_URL = (import.meta as unknown as Record<string, string>).VITE_API_URL || 'http://localhost:4000';

// Base API with RTK Query
export const foodApi = createApi({
  reducerPath: 'foodApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
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
    sendOTP: builder.mutation<{ success: boolean; message?: string }, { phone?: string; email?: string }>({
      query: (body) => ({
        url: '/auth/otp',
        method: 'POST',
        body,
      }),
    }),
    
    verifyOTP: builder.mutation<{ token: string; user: User }, { phone?: string; email?: string; code: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    
    // Password reset
    requestPasswordReset: builder.mutation<{ success: boolean; message?: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/password-reset',
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
  useRequestPasswordResetMutation,
} = foodApi;
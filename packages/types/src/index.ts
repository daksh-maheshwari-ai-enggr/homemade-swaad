// User types
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  name?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User returned by the auth endpoints (dates are ISO strings over JSON)
export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Menu types
export interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentIntent?: string | null;
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: number;
  quantity: number;
  price: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user: User;
}

// OTP types
export interface OTP {
  id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
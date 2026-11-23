export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export interface User {
    id: string;
    phone: string;
    name?: string | null;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
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
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
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
export interface OTP {
    id: string;
    phone: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map
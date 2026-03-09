import { API_BASE_URL } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'anose_admin_token';

// Get token from secure storage (or localStorage on web)
async function getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

// Save token
export async function saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

// Delete token
export async function deleteToken(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Authenticated fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        await deleteToken();
        throw new Error('SESSION_EXPIRED');
    }

    return res;
}

// ========================
// Auth
// ========================
export async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/api/admin/mobile-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    await saveToken(data.token);
    return data;
}

export async function loginWithGoogle(googleToken: string) {
    const res = await fetch(`${API_BASE_URL}/api/admin/mobile-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google login failed');
    await saveToken(data.token);
    return data;
}

export async function verifyToken() {
    const res = await apiFetch('/api/admin/mobile-auth');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid token');
    return data;
}

export async function logout() {
    await deleteToken();
}

// ========================
// Stats / Dashboard
// ========================
export async function getStats() {
    const res = await apiFetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

// ========================
// Orders
// ========================
export async function getOrders(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.status) sp.set('status', params.status);
    if (params.search) sp.set('search', params.search);
    const res = await apiFetch(`/api/admin/orders?${sp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
}

export async function getOrderDetail(id: string) {
    const res = await apiFetch(`/api/admin/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
}

export async function updateOrderStatus(id: string, status: string) {
    const res = await apiFetch('/api/admin/orders', {
        method: 'PUT',
        body: JSON.stringify({ id, status }),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
}

// ========================
// Products
// ========================
export async function getProducts(params: { page?: number; limit?: number; search?: string; sortBy?: string } = {}) {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.search) sp.set('search', params.search);
    if (params.sortBy) sp.set('sortBy', params.sortBy);
    const res = await apiFetch(`/api/admin/products?${sp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function getProductDetail(id: string) {
    const res = await apiFetch(`/api/admin/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
}

export async function createProduct(data: any) {
    const res = await apiFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
}

export async function updateProduct(id: string, data: any) {
    const res = await apiFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
}

export async function uploadImage(uri: string, filename: string, type: string) {
    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', {
        uri,
        name: filename,
        type,
    } as any);

    const res = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload image');
    }
    return res.json();
}

// ========================
// Reviews
// ========================
export async function getReviews(params: { page?: number; status?: string } = {}) {
    const sp = new URLSearchParams();
    if (params.page) sp.set('page', String(params.page));
    if (params.status) sp.set('status', params.status);
    const res = await apiFetch(`/api/admin/reviews?${sp.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
}

export async function updateReview(id: string, isApproved: boolean) {
    const res = await apiFetch('/api/admin/reviews', {
        method: 'PUT',
        body: JSON.stringify({ id, isApproved }),
    });
    if (!res.ok) throw new Error('Failed to update review');
    return res.json();
}

export async function deleteReview(id: string) {
    const res = await apiFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete review');
    return res.json();
}

// ========================
// Inquiries
// ========================
export async function getInquiries() {
    const res = await apiFetch('/api/admin/inquiries');
    if (!res.ok) throw new Error('Failed to fetch inquiries');
    return res.json();
}

export async function updateInquiryStatus(id: string, status: string) {
    const res = await apiFetch('/api/admin/inquiries', {
        method: 'PUT',
        body: JSON.stringify({ id, status }),
    });
    if (!res.ok) throw new Error('Failed to update inquiry');
    return res.json();
}

export async function deleteInquiry(id: string) {
    const res = await apiFetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete inquiry');
    return res.json();
}

// ========================
// Subscribers
// ========================
export async function getSubscribers() {
    const res = await apiFetch('/api/admin/subscribers');
    if (!res.ok) throw new Error('Failed to fetch subscribers');
    return res.json();
}

// ========================
// Promo Codes
// ========================
export async function getPromoCodes() {
    const res = await apiFetch('/api/admin/promocodes');
    if (!res.ok) throw new Error('Failed to fetch promo codes');
    return res.json();
}

export async function createPromoCode(data: any) {
    const res = await apiFetch('/api/admin/promocodes', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create promo code');
    return res.json();
}

export async function deletePromoCode(id: string) {
    const res = await apiFetch(`/api/admin/promocodes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete promo code');
    return res.json();
}

// ========================
// Users
// ========================
export async function getUsers() {
    const res = await apiFetch('/api/admin/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

// ========================
// Leads
// ========================
export async function getLeads() {
    const res = await apiFetch('/api/funnel');
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
}

export async function createLead(data: any) {
    const res = await apiFetch('/api/admin/leads', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
}

export async function updateLead(id: string, data: any) {
    const res = await apiFetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
}

export async function getLeadDetail(id: string) {
    const res = await apiFetch(`/api/admin/leads/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lead');
    return res.json();
}

export async function deleteLead(id: string) {
    const res = await apiFetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lead');
    return res.json();
}

export async function addLeadNote(leadId: string, content: string) {
    const res = await apiFetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
}

export async function getFollowUps(leadId: string) {
    const res = await apiFetch(`/api/admin/leads/${leadId}/followups`);
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return res.json();
}

export async function addFollowUp(leadId: string, data: { scheduledAt: string; notes?: string }) {
    const res = await apiFetch(`/api/admin/leads/${leadId}/followups`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add follow-up');
    return res.json();
}

export async function completeFollowUp(leadId: string, followUpId: string) {
    const res = await apiFetch(`/api/admin/leads/${leadId}/followups/${followUpId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (!res.ok) throw new Error('Failed to complete follow-up');
    return res.json();
}

export async function deleteFollowUp(leadId: string, followUpId: string) {
    const res = await apiFetch(`/api/admin/leads/${leadId}/followups/${followUpId}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete follow-up');
    return res.json();
}

export async function registerPushToken(token: string, platform: string) {
    const res = await apiFetch('/api/admin/push-token', {
        method: 'POST',
        body: JSON.stringify({ token, platform }),
    });
    if (!res.ok) throw new Error('Failed to register push token');
    return res.json();
}

export async function removePushToken(token: string) {
    const res = await apiFetch(`/api/admin/push-token?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove push token');
    return res.json();
}

// ========================
// Products
// ========================
export async function getAdminProducts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`/api/admin/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

// ========================
// Manual Order Creation
// ========================
export async function createOrder(data: any) {
    const res = await apiFetch('/api/admin/orders/create', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
}

// ========================
// Abandoned Checkouts
// ========================
export async function getAbandonedCheckouts() {
    const res = await apiFetch('/api/admin/abandoned-checkouts');
    if (!res.ok) throw new Error('Failed to fetch abandoned checkouts');
    return res.json();
}

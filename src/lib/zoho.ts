/**
 * Zoho Invoice API Service
 * Handles OAuth 2.0 token management and API calls to Zoho Invoice
 */

interface ZohoTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface ZohoInvoice {
    invoice_id: string;
    invoice_number: string;
    customer_id: string;
    customer_name: string;
    status: string;
    date: string;
    due_date: string;
    total: number;
    balance: number;
    currency_code: string;
}

interface ZohoInvoicesResponse {
    code: number;
    message: string;
    invoices: ZohoInvoice[];
    page_context: {
        page: number;
        per_page: number;
        has_more_page: boolean;
        total_count: number;
    };
}

interface ZohoInvoiceDetail extends ZohoInvoice {
    line_items: Array<{
        item_id: string;
        name: string;
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;
    billing_address: {
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    shipping_address: {
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    notes: string;
    terms: string;
}

interface CreateInvoicePayload {
    customer_id: string;
    invoice_number?: string;
    date?: string;
    due_date?: string;
    line_items: Array<{
        name: string;
        description?: string;
        quantity: number;
        rate: number;
    }>;
    notes?: string;
    terms?: string;
}

// Get Zoho API base URL based on region
function getZohoBaseUrl(): string {
    // India region - use .in domain
    return 'https://www.zohoapis.in/invoice/v3';
}

// Token cache
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 min buffer)
    if (cachedAccessToken && Date.now() < tokenExpiresAt - 300000) {
        return cachedAccessToken;
    }

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Zoho API credentials. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.');
    }

    const tokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
    const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
    });

    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Zoho token refresh failed:', error);
        throw new Error('Failed to refresh Zoho access token');
    }

    const data: ZohoTokenResponse = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return cachedAccessToken;
}

/**
 * Make an authenticated request to Zoho Invoice API
 */
async function zohoRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: object
): Promise<T> {
    const accessToken = await getAccessToken();
    const organizationId = process.env.ZOHO_ORGANIZATION_ID;

    if (!organizationId) {
        throw new Error('Missing ZOHO_ORGANIZATION_ID');
    }

    const url = `${getZohoBaseUrl()}${endpoint}`;
    const headers: HeadersInit = {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': organizationId,
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.text();
        console.error(`Zoho API error (${endpoint}):`, error);
        throw new Error(`Zoho API request failed: ${response.status}`);
    }

    return response.json();
}

/**
 * Get list of invoices from Zoho
 */
export async function getInvoices(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    customer_id?: string;
    date_start?: string;
    date_end?: string;
}): Promise<ZohoInvoicesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customer_id) searchParams.set('customer_id', params.customer_id);
    if (params?.date_start) searchParams.set('date_start', params.date_start);
    if (params?.date_end) searchParams.set('date_end', params.date_end);

    const queryString = searchParams.toString();
    const endpoint = `/invoices${queryString ? `?${queryString}` : ''}`;

    return zohoRequest<ZohoInvoicesResponse>(endpoint);
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<{ invoice: ZohoInvoiceDetail }> {
    return zohoRequest<{ invoice: ZohoInvoiceDetail }>(`/invoices/${invoiceId}`);
}

/**
 * Create a new invoice in Zoho
 */
export async function createInvoice(payload: CreateInvoicePayload): Promise<{ invoice: ZohoInvoice }> {
    return zohoRequest<{ invoice: ZohoInvoice }>('/invoices', 'POST', payload);
}

/**
 * Send an invoice via email
 */
export async function sendInvoice(invoiceId: string, emailOptions?: {
    to_mail_ids?: string[];
    cc_mail_ids?: string[];
    subject?: string;
    body?: string;
}): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/invoices/${invoiceId}/email`, 'POST', emailOptions || {});
}

/**
 * Get invoice PDF URL
 */
export async function getInvoicePdf(invoiceId: string): Promise<{ download_url: string }> {
    // For PDF, we need to handle it differently - Zoho returns the PDF directly
    const accessToken = await getAccessToken();
    const organizationId = process.env.ZOHO_ORGANIZATION_ID;

    const url = `${getZohoBaseUrl()}/invoices/${invoiceId}?accept=pdf`;

    return {
        download_url: `${url}&organization_id=${organizationId}&access_token=${accessToken}`
    };
}

export async function getInvoicePdfBuffer(zohoInvoiceId: string): Promise<Buffer> {
    const accessToken = await getAccessToken();
    const organizationId = process.env.ZOHO_ORGANIZATION_ID;

    const response = await fetch(`${getZohoBaseUrl()}/invoices/${zohoInvoiceId}?accept=pdf`, {
        headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'X-com-zoho-invoice-organizationid': organizationId!,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF from Zoho: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Get list of customers from Zoho
 */
export async function getCustomers(params?: {
    page?: number;
    per_page?: number;
    search_text?: string;
}): Promise<{ contacts: Array<{ contact_id: string; contact_name: string; email: string }> }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.search_text) searchParams.set('search_text', params.search_text);

    const queryString = searchParams.toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;

    return zohoRequest(endpoint);
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceAsSent(invoiceId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/invoices/${invoiceId}/status/sent`, 'POST');
}

/**
 * Void an invoice
 */
export async function voidInvoice(invoiceId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/invoices/${invoiceId}/status/void`, 'POST');
}

// ============= EXPENSE MANAGEMENT =============

interface ZohoExpense {
    expense_id: string;
    date: string;
    account_name: string;
    paid_through_account_name: string;
    description: string;
    currency_code: string;
    total: number;
    is_billable: boolean;
    customer_name: string;
    vendor_name: string;
    reference_number: string;
    status: string;
}

interface ZohoExpensesResponse {
    code: number;
    message: string;
    expenses: ZohoExpense[];
    page_context: {
        page: number;
        per_page: number;
        has_more_page: boolean;
        total_count: number;
    };
}

interface CreateExpensePayload {
    account_id: string;
    date: string;
    amount: number;
    paid_through_account_id?: string;
    vendor_id?: string;
    is_billable?: boolean;
    description?: string;
    reference_number?: string;
}

/**
 * Get list of expenses from Zoho
 */
export async function getExpenses(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    date_start?: string;
    date_end?: string;
    filter_by?: string;
}): Promise<ZohoExpensesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.date_start) searchParams.set('date_start', params.date_start);
    if (params?.date_end) searchParams.set('date_end', params.date_end);
    if (params?.filter_by) searchParams.set('filter_by', params.filter_by);

    const queryString = searchParams.toString();
    const endpoint = `/expenses${queryString ? `?${queryString}` : ''}`;

    return zohoRequest<ZohoExpensesResponse>(endpoint);
}

/**
 * Get a single expense by ID
 */
export async function getExpense(expenseId: string): Promise<{ expense: ZohoExpense }> {
    return zohoRequest<{ expense: ZohoExpense }>(`/expenses/${expenseId}`);
}

/**
 * Create a new expense in Zoho
 */
export async function createExpense(payload: CreateExpensePayload): Promise<{ expense: ZohoExpense }> {
    return zohoRequest<{ expense: ZohoExpense }>('/expenses', 'POST', payload);
}

/**
 * Delete an expense in Zoho
 */
export async function deleteExpense(expenseId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/expenses/${expenseId}`, 'DELETE');
}

/**
 * Get expense accounts (categories) from Zoho
 */
export async function getExpenseAccounts(): Promise<{ chartofaccounts: Array<{ account_id: string; account_name: string; account_type: string }> }> {
    return zohoRequest('/chartofaccounts?account_type=expense');
}

// ============= ESTIMATES/QUOTATIONS MANAGEMENT =============

interface ZohoEstimate {
    estimate_id: string;
    estimate_number: string;
    customer_id: string;
    customer_name: string;
    status: string;
    date: string;
    expiry_date: string;
    total: number;
    sub_total: number;
    discount: number;
    tax_total: number;
    currency_code: string;
    reference_number: string;
    notes: string;
    terms: string;
    line_items: Array<{
        item_id: string;
        name: string;
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;
}

interface ZohoEstimatesResponse {
    code: number;
    message: string;
    estimates: ZohoEstimate[];
    page_context: {
        page: number;
        per_page: number;
        has_more_page: boolean;
        total_count: number;
    };
}

interface CreateEstimatePayload {
    customer_id: string;
    estimate_number?: string;
    date?: string;
    expiry_date?: string;
    line_items: Array<{
        name: string;
        description?: string;
        quantity: number;
        rate: number;
    }>;
    notes?: string;
    terms?: string;
    discount?: number;
}

/**
 * Get list of estimates/quotations from Zoho
 */
export async function getEstimates(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    customer_id?: string;
    date_start?: string;
    date_end?: string;
}): Promise<ZohoEstimatesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customer_id) searchParams.set('customer_id', params.customer_id);
    if (params?.date_start) searchParams.set('date_start', params.date_start);
    if (params?.date_end) searchParams.set('date_end', params.date_end);

    const queryString = searchParams.toString();
    const endpoint = `/estimates${queryString ? `?${queryString}` : ''}`;

    return zohoRequest<ZohoEstimatesResponse>(endpoint);
}

/**
 * Get a single estimate by ID
 */
export async function getEstimate(estimateId: string): Promise<{ estimate: ZohoEstimate }> {
    return zohoRequest<{ estimate: ZohoEstimate }>(`/estimates/${estimateId}`);
}

/**
 * Create a new estimate in Zoho
 */
export async function createEstimate(payload: CreateEstimatePayload): Promise<{ estimate: ZohoEstimate }> {
    return zohoRequest<{ estimate: ZohoEstimate }>('/estimates', 'POST', payload);
}

/**
 * Update an existing estimate in Zoho
 */
export async function updateEstimate(estimateId: string, payload: Partial<CreateEstimatePayload>): Promise<{ estimate: ZohoEstimate }> {
    return zohoRequest<{ estimate: ZohoEstimate }>(`/estimates/${estimateId}`, 'PUT', payload);
}

/**
 * Send estimate to customer via email
 */
export async function sendEstimate(estimateId: string, emailOptions?: {
    to_mail_ids?: string[];
    subject?: string;
    body?: string;
}): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/estimates/${estimateId}/email`, 'POST', emailOptions || {});
}

/**
 * Mark estimate as sent
 */
export async function markEstimateAsSent(estimateId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/estimates/${estimateId}/status/sent`, 'POST');
}

/**
 * Mark estimate as accepted
 */
export async function acceptEstimate(estimateId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/estimates/${estimateId}/status/accepted`, 'POST');
}

/**
 * Mark estimate as declined
 */
export async function declineEstimate(estimateId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/estimates/${estimateId}/status/declined`, 'POST');
}

/**
 * Delete an estimate in Zoho
 */
export async function deleteEstimate(estimateId: string): Promise<{ message: string }> {
    return zohoRequest<{ message: string }>(`/estimates/${estimateId}`, 'DELETE');
}

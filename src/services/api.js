/**
 * Centralized API client for the local Express backend.
 *
 * Replaces the previous n8n webhook integration. All calls go to the relative
 * "/api" path, which Vite proxies to the Express server in development. The
 * session token is attached automatically as a Bearer header.
 */

const TOKEN_KEY = 'dvl_token';

/**
 * Reads the stored session token.
 * @returns {string|null} The JWT, or null if not authenticated.
 */
export const getToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Persists (or clears) the session token.
 * @param {string|null} token - The JWT to store, or null to remove it.
 */
export const setToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

/**
 * Performs an authenticated JSON request against the API.
 * @param {string} path - The endpoint path (e.g. "/api/auth/login").
 * @param {Object} [options] - Fetch-like options.
 * @param {string} [options.method] - HTTP method (default GET).
 * @param {Object} [options.body] - JSON body for write methods.
 * @param {Object} [options.query] - Query parameters appended to the URL.
 * @returns {Promise<Object>} The parsed JSON response.
 * @throws {Error} When the response status is not in the 2xx range.
 */
const request = async (path, { method = 'GET', body = null, query = null } = {}) => {
    let url = path;
    if (query) {
        const qs = new URLSearchParams(
            Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
        ).toString();
        if (qs) url = `${url}?${qs}`;
    }

    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const options = { method, headers };
    if (body && method !== 'GET' && method !== 'DELETE') {
        options.body = JSON.stringify(body);
    }

    let response;
    try {
        response = await fetch(url, options);
    } catch {
        // Network-level failure (server down, no connection).
        throw new Error('No se pudo conectar con el servidor');
    }

    const text = await response.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { success: false, message: 'Respuesta invalida del servidor' };
    }

    if (!response.ok) {
        const error = new Error(data.message || `Error HTTP ${response.status}`);
        // Expose the full payload so callers can read structured details
        // (e.g. the list of out-of-stock products on a 409).
        error.data = data;
        error.status = response.status;
        throw error;
    }

    return data;
};

/**
 * Builds a standard CRUD set of methods for a REST resource.
 * @param {string} base - The resource base path (e.g. "/api/suppliers").
 * @returns {Object} Methods: list, get, create, update, remove.
 */
const crud = (base) => ({
    list: (query) => request(base, { query }),
    get: (id) => request(`${base}/${id}`),
    create: (body) => request(base, { method: 'POST', body }),
    update: (id, body) => request(`${base}/${id}`, { method: 'PUT', body }),
    remove: (id) => request(`${base}/${id}`, { method: 'DELETE' }),
});

export const apiService = {
    request,

    auth: {
        login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
        register: (userData) => request('/api/auth/register', { method: 'POST', body: userData }),
        me: () => request('/api/auth/me'),
    },

    // Resource clients are wired to their routers in the corresponding phases.
    roles: crud('/api/roles'),
    users: crud('/api/users'),
    products: crud('/api/products'),
    inventory: crud('/api/inventory'),

    suppliers: {
        ...crud('/api/suppliers'),
        history: (id) => request(`/api/suppliers/${id}/history`),
        sendMessage: (id, body) => request(`/api/suppliers/${id}/messages`, { method: 'POST', body }),
    },

    orders: {
        ...crud('/api/orders'),
        create: (body) => request('/api/orders', { method: 'POST', body }),
        updateStatus: (id, estado) => request(`/api/orders/${id}/status`, { method: 'PUT', body: { estado } }),
    },

    purchaseOrders: {
        create: (body) => request('/api/purchase-orders', { method: 'POST', body }),
        receive: (id) => request(`/api/purchase-orders/${id}/receive`, { method: 'PUT' }),
        cancel: (id) => request(`/api/purchase-orders/${id}/cancel`, { method: 'PUT' }),
    },

    clients: {
        list: (query) => request('/api/clients', { query }),
        history: (id) => request(`/api/clients/${id}/history`),
    },

    sales: {
        summary: (range) => request('/api/sales/summary', { query: { range } }),
    },

    stats: {
        overview: () => request('/api/stats/overview'),
    },
};

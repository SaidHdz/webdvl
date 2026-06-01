/**
 * Centralized API service to handle all external communications.
 * This layer abstracts the fetch logic and ensures a common error handling strategy.
 */

const API_BASE_URLS = {
    login: import.meta.env.VITE_N8N_LOGIN_URL,
    register: import.meta.env.VITE_N8N_REGISTER_URL,
    crm: import.meta.env.VITE_N8N_CRM_URL,
    adminSummary: import.meta.env.VITE_N8N_ADMIN_SUMMARY_URL,
    adminSearch: `${import.meta.env.VITE_API_URL}/api/admin/search`,
    adminRH: `${import.meta.env.VITE_API_URL}/api/admin/rh`,
    adminSuppliers: "https://n8n.srv1574981.hstgr.cloud/webhook/api/admin/suppliers",
    adminClients: `${import.meta.env.VITE_API_URL}/api/admin/clients`,
    adminLogistics: "https://n8n.srv1574981.hstgr.cloud/webhook/api/admin/orders_logistics",
    adminUpdateStatus: "https://n8n.srv1574981.hstgr.cloud/webhook/api/admin/orders/update-status",
};

/**
 * Generic request handler.
 * @param {string} type - The type of request.
 * @param {Object} [payload] - The data to send.
 * @param {string} [method='POST'] - HTTP method.
 * @param {Object} [query] - Query parameters for GET requests.
 * @returns {Promise<Object>} The server response.
 */
const apiRequest = async (type, payload = null, method = 'POST', query = null) => {
    let url = API_BASE_URLS[type];
    
    if (!url) {
        throw new Error(`API URL for type "${type}" is not defined.`);
    }

    if (query) {
        const queryString = new URLSearchParams(query).toString();
        url = `${url}?${queryString}`;
    }

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (payload && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);
        const text = await response.text();
        let data = {};

        try {
            data = text ? JSON.parse(text) : {};
            
            // NORMALIZACIÓN PARA N8N
            if (Array.isArray(data) && data.length > 0 && data[0].body) {
                const n8nOutput = data[0].body;
                data = { success: true, ...n8nOutput };
                if (n8nOutput.nombre || n8nOutput.email) {
                    data.user = { name: n8nOutput.nombre || n8nOutput.name, email: n8nOutput.email };
                }
            } else if (Array.isArray(data) && data.length === 0) {
                data = { success: true };
            }
            
            if (response.ok && data.success === undefined) {
                data.success = true;
            }
        } catch (e) {
            // Manejo de errores específicos de n8n en modo test
            if (text.includes('No Respond to Webhook node found')) {
                console.warn('n8n Warning: Workflow executed but no response node was found. Assuming success.');
                data = { success: true, message: 'Workflow iniciado' };
            } else if (response.ok && (text === 'OK' || text.includes('Workflow started'))) {
                data = { success: true };
            } else {
                data = { success: false, message: 'Respuesta inválida del servidor' };
            }
        }

        // Si es un error 500 pero es por falta de nodo de respuesta, lo dejamos pasar como éxito
        if (!response.ok && !text.includes('No Respond to Webhook node found')) {
            throw new Error(data.message || `HTTP Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${type}):`, error);
        throw error;
    }
};

export const apiService = {
    login: (email, password) => apiRequest('login', { email, password }),
    register: (userData) => apiRequest('register', {
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre || userData.name
    }),
    sendCrmEvent: (payload) => apiRequest('crm', payload),
    
    // Mega-JSON Endpoint: Obtiene metrics, crm (clientes), scm (inventario) y rh (empleados) de un solo golpe
    getAdminMegaData: () => apiRequest('adminSummary', null, 'GET'),
    
    // SCM Suppliers
    getSuppliers: () => apiRequest('adminSuppliers', null, 'GET'),

    // CRM Clients
    getClients: () => apiRequest('adminClients', null, 'GET'),

    // Logistics Orders
    getLogistics: () => apiRequest('adminLogistics', null, 'GET'),

    updateOrderStatus: (idPedido, nuevoEstado) => apiRequest('adminUpdateStatus', {
        id_pedido: idPedido,
        nuevo_estado: nuevoEstado
    }, 'POST'),
};

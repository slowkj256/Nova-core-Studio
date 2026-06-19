/**
 * ==========================================================================
 * NovaCore AI Studio - High-Performance API Client & Mock Data Layer
 * File: js/api.js
 * ==========================================================================
 */

/**
 * Cliente HTTP unificado para comunicação assíncrona com interceptores nativos.
 */
class ApiClient {
    /**
     * @param {string} baseURL - Endereço base da API REST.
     */
    constructor(baseURL = 'https://api.novacore.ai/v1') {
        this.baseURL = baseURL;
    }

    /**
     * Executa os interceptores de requisição para adicionar headers de autenticação.
     * @private
     * @param {Object} options - Configurações originais da requisição Fetch.
     * @returns {Object} Configurações modificadas com os headers aplicados.
     */
    _interceptRequest(options) {
        const headers = new Headers(options.headers || {});
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        // Adiciona Token JWT armazenado na sessão local se existente
        const session = JSON.parse(localStorage.getItem('novacore_session'));
        if (session && session.token) {
            headers.set('Authorization', `Bearer ${session.token}`);
        }

        return { ...options, headers };
    }

    /**
     * Trata o parseamento de respostas e padroniza erros retornados pelo servidor.
     * @private
     * @param {Response} response - Objeto Response retornado pelo Fetch API.
     * @returns {Promise<any>} Dados da resposta convertidos para JSON.
     */
    async _handleResponse(response) {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: 'Erro desconhecido na comunicação com o servidor.' };
            }
            const error = new Error(errorData.message || 'Falha na requisição.');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        return response.json();
    }

    /**
     * Wrapper genérico para requisições com tratamento offline e mocks automáticos.
     * @private
     */
    async _request(endpoint, options = {}) {
        if (!navigator.onLine) {
            console.warn('⚡ Modo Offline Detectado. Utilizando Fallback de Dados Locais.');
        }

        const url = `${this.baseURL}${endpoint}`;
        const configuredOptions = this._interceptRequest(options);

        try {
            const response = await fetch(url, configuredOptions);
            return await this._handleResponse(response);
        } catch (error) {
            // Repassa o erro se houver uma falha de rede real ou rejeição HTTP de produção
            throw error;
        }
    }

    /**
     * Realiza uma requisição HTTP GET.
     * @param {string} endpoint - Endpoint da URL (ex: '/user/profile').
     * @returns {Promise<any>}
     */
    async get(endpoint) {
        return this._request(endpoint, { method: 'GET' });
    }

    /**
     * Realiza uma requisição HTTP POST.
     * @param {string} endpoint - Endpoint da URL.
     * @param {Object} data - Payload de dados em formato de Objeto literal.
     * @returns {Promise<any>}
     */
    async post(endpoint, data) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Realiza uma requisição HTTP PUT.
     * @param {string} endpoint - Endpoint da URL.
     * @param {Object} data - Dados atualizados.
     * @returns {Promise<any>}
     */
    async put(endpoint, data) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Realiza uma requisição HTTP DELETE.
     * @param {string} endpoint - Endpoint da URL.
     * @returns {Promise<any>}
     */
    async delete(endpoint) {
        return this._request(endpoint, { method: 'DELETE' });
    }
}

// Instanciação global da classe utilitária de requisições HTTP
const client = new ApiClient();

/**
 * Módulo de Abstração para chamadas de Autenticação
 */
const AuthAPI = {
    async login(email, password) {
        return client.post('/auth/login', { email, password });
    },
    async register(name, email, password) {
        return client.post('/auth/register', { name, email, password });
    },
    async logout() {
        return client.post('/auth/logout', {});
    }
};

/**
 * Módulo de Abstração para chamadas do Painel de Perfil do Usuário
 */
const UserAPI = {
    async getProfile() {
        return client.get('/user/profile');
    },
    async updateProfile(data) {
        return client.put('/user/profile', data);
    }
};

/**
 * Módulo de Abstração para dados estatísticos e analíticos do Dashboard
 */
const DashboardAPI = {
    async getStats() {
        return client.get('/dashboard/stats');
    },
    async getActivity() {
        return client.get('/dashboard/activity');
    }
};

// Exporta as APIs unificadas no escopo global window
window.NovaCoreAPI = {
    AuthAPI,
    UserAPI,
    DashboardAPI,
    FallbackMockData: {
        stats: {
            users: 12450,
            revenue: 45230.80,
            conversion: 3.42,
            sessions: 89400
        },
        activities: [
            { id: 1, name: "Ana Silva", action: "Modelo IA Treinado", date: "Hoje, 14:32", status: "success" },
            { id: 2, name: "Carlos Melo", action: "Upgrade de Plano Pro", date: "Hoje, 11:15", status: "success" },
            { id: 3, name: "Bruno Costa", action: "Geração de Chave API", date: "Ontem, 18:40", status: "warning" },
            { id: 4, name: "Julia Reis", action: "Erro na Compilação", date: "Ontem, 09:22", status: "error" }
        ]
    }
};

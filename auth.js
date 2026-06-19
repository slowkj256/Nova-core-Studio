/**
 * ==========================================================================
 * NovaCore AI Studio - Frontend Authentication System & Route Guards
 * File: js/auth.js
 * ==========================================================================
 */

/**
 * Sistema nativo de gerenciamento de sessão, criptografia simulada e persistência em localStorage.
 */
const NovaCoreAuth = {
    /**
     * Registra um novo usuário validando duplicidade no banco local simulado.
     * @param {string} name - Nome completo do usuário.
     * @param {string} email - Endereço eletrônico.
     * @param {string} password - Senha de segurança.
     * @returns {Promise<Object>} Promessa resolvida com os dados do usuário cadastrado.
     */
    async register(name, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('novacore_users') || '[]');
                
                // Verifica a existência prévia do email
                const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
                if (userExists) {
                    return reject(new Error('Este endereço de e-mail já está sendo utilizado por outra conta.'));
                }

                const newUser = {
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    name,
                    email: email.toLowerCase(),
                    password: btoa(password), // Codificação Base64 básica simulando hash de segurança
                    createdAt: new Date().toISOString(),
                    role: 'developer',
                    plan: 'Free'
                };

                users.push(newUser);
                localStorage.setItem('novacore_users', JSON.stringify(users));
                resolve({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
            }, 800); // Latência simulada de rede
        });
    },

    /**
     * Autentica as credenciais fornecidas contra o banco local armazenado.
     * @param {string} email - E-mail do usuário.
     * @param {string} password - Senha em texto limpo.
     * @param {boolean} rememberMe - Flag indicadora para salvar persistência estendida.
     * @returns {Promise<Object>} Dados da sessão criada.
     */
    async login(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('novacore_users') || '[]');
                const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (!foundUser || btoa(password) !== foundUser.password) {
                    return reject(new Error('Credenciais inválidas. Verifique seu e-mail e senha.'));
                }

                // Cria o objeto de sessão com token JWT simulado de expiração em 24h
                const sessionToken = 'jwt_' + btoa(foundUser.id + '.' + Date.now()) + '.' + Math.random().toString(36).substr(2, 20);
                const sessionData = {
                    token: sessionToken,
                    user: {
                        id: foundUser.id,
                        name: foundUser.name,
                        email: foundUser.email,
                        role: foundUser.role,
                        plan: foundUser.plan
                    },
                    expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)
                };

                localStorage.setItem('novacore_session', JSON.stringify(sessionData));
                
                if (rememberMe) {
                    localStorage.setItem('novacore_remembered_email', foundUser.email);
                } else {
                    localStorage.removeItem('novacore_remembered_email');
                }

                window.NovaCoreState.set('userSession', sessionData);
                resolve({ success: true, session: sessionData });
            }, 1000);
        });
    },

    /**
     * Remove os registros ativos de sessão do navegador e limpa estados em memória.
     */
    logout() {
        localStorage.removeItem('novacore_session');
        window.NovaCoreState.set('userSession', null);
        window.location.replace('login.html');
    },

    /**
     * Recupera os dados da sessão corrente se a mesma ainda for considerada válida.
     * @returns {Object|null} Objeto da sessão ou null caso expirada/inexistente.
     */
    getCurrentSession() {
        const sessionStr = localStorage.getItem('novacore_session');
        if (!sessionStr) return null;

        try {
            const session = JSON.parse(sessionStr);
            if (Date.now() > session.expiresAt) {
                localStorage.removeItem('novacore_session');
                return null;
            }
            return session;
        } catch {
            return null;
        }
    },

    /**
     * Middleware de barreira de acesso que previne navegação anônima em páginas privadas.
     */
    requireAuth() {
        const session = this.getCurrentSession();
        if (!session) {
            window.location.replace('login.html?redirect=' + encodeURIComponent(window.location.pathname));
        }
    },

    /**
     * Redireciona o usuário para a área restrita caso o mesmo já possua autenticação ativa.
     */
    redirectIfAuthenticated() {
        const session = this.getCurrentSession();
        if (session) {
            window.location.replace('dashboard.html');
        }
    }
};

window.NovaCoreAuth = NovaCoreAuth;

// Auto-executável para monitoramento e validação de rotas em tempo de execução
(() => {
    const currentPath = window.location.pathname;
    
    // Lista de rotas protegidas que exigem barreira de segurança
    const protectedRoutes = ['/dashboard.html', '/profile.html', '/settings.html', 'dashboard.html', 'profile.html', 'settings.html'];
    const authRoutes = ['/login.html', '/register.html', 'login.html', 'register.html'];

    const isProtected = protectedRoutes.some(route => currentPath.endsWith(route));
    const isAuthRoute = authRoutes.some(route => currentPath.endsWith(route));

    if (isProtected) {
        NovaCoreAuth.requireAuth();
    } else if (isAuthRoute) {
        NovaCoreAuth.redirectIfAuthenticated();
    }
})();

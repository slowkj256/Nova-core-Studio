/**
 * ==========================================================================
 * NovaCore AI Studio - Global Core Utilities & Application State
 * File: js/core.js
 * ==========================================================================
 */

/**
 * Classe principal gerenciadora do estado global da aplicação.
 * Implementa padrões de publicação/assinatura para mudanças de dados de forma reativa.
 */
class CoreStateManager {
    constructor() {
        this.state = {
            theme: 'dark',
            sidebarCollapsed: false,
            notifications: [],
            activeToasts: [],
            userSession: null
        };
        this.listeners = {};
    }

    /**
     * Recupera o valor de uma chave específica do estado.
     * @param {string} key - Chave do estado.
     * @returns {*} Valor associado.
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Define um novo valor para uma chave e notifica assinantes.
     * @param {string} key - Chave do estado a modificar.
     * @param {*} value - Novo valor a ser inserido.
     */
    set(key, value) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            this.notify(key, value);
        }
    }

    /**
     * Assina modificações de uma determinada chave do estado.
     * @param {string} key - Chave a monitorar.
     * @param {Function} callback - Função executada na mudança.
     */
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
    }

    /**
     * Dispara todos os callbacks associados a uma modificação de estado.
     * @param {string} key - Chave modificada.
     * @param {*} value - Novo valor atribuído.
     */
    notify(key, value) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => callback(value));
        }
    }
}

// Instanciação global do gerenciador de estado
window.NovaCoreState = new CoreStateManager();

/**
 * Utilitários de Domínio de Manipulação e Formatação Globais
 */
const NovaCoreUtils = {
    /**
     * Formata um valor numérico padrão para moeda corrente brasileira (BRL).
     * @param {number} value - Número a ser formatado.
     * @returns {string} Moeda formatada.
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Formata números extensos adicionando notação compacta (K, M, B).
     * @param {number} value - Número bruto.
     * @returns {string} Formato compactado.
     */
    formatCompactNumber(value) {
        return new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            compactDisplay: 'short'
        }).format(value);
    },

    /**
     * Cria um debounce para limitar a frequência de execução de uma função.
     * @param {Function} func - Função alvo.
     * @param {number} wait - Tempo de espera em milissegundos.
     * @returns {Function} Função encapsulada com debounce.
     */
    debounce(func, wait = 250) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escapa caracteres HTML maliciosos para mitigar vetores Cross-Site Scripting (XSS).
     * @param {string} string - Conteúdo bruto fornecido por input ou API.
     * @returns {string} Texto tratado de forma segura.
     */
    escapeHTML(string) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;'
        };
        const reg = /[&<>"'/]/ig;
        return string.replace(reg, (match) => map[match]);
    }
};

window.NovaCoreUtils = NovaCoreUtils;

/**
 * Inicializador global do ecossistema de interface básica da página
 */
document.addEventListener('DOMContentLoaded', () => {
    // Sincroniza estado inicial do menu flutuante e do header responsivo
    const headerElement = document.querySelector('.landing-header');
    
    if (headerElement) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                headerElement.classList.add('is-scrolled');
            } else {
                headerElement.classList.remove('is-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Gerenciador genérico para fechar dropdowns e menus se houver clique fora do escopo
    document.addEventListener('click', (e) => {
        const activeDropdowns = document.querySelectorAll('.dropdown-wrapper.is-open');
        activeDropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('is-open');
            }
        });
    });
});

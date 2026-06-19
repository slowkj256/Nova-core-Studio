/**
 * ==========================================================================
 * NovaCore AI Studio - Dynamic UI Components Manager
 * File: js/components.js
 * ==========================================================================
 */

/**
 * Sistema nativo de gerenciamento de componentes visuais interativos.
 * Controla o ciclo de vida e renderização de Modais, Toasts, Tooltips e Dropdowns.
 */
class NovaCoreComponentsManager {
    constructor() {
        this.toastContainerId = 'nova-toast-container';
        this._ensureToastContainer();
        this.initDropdowns();
        this.initModals();
    }

    /**
     * Garante a infraestrutura física de contêiner de Toasts no DOM.
     * @private
     */
    _ensureToastContainer() {
        let container = document.getElementById(this.toastContainerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.toastContainerId;
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.toastContainer = container;
    }

    /**
     * Instancia e exibe um alerta do tipo Toast na tela de forma temporizada.
     * @param {string} message - O texto principal da notificação.
     * @param {'success'|'error'|'warning'|'info'} type - Variante visual do componente.
     * @param {number} duration - Tempo de exibição ativa em milissegundos.
     */
    showToast(message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-item is-${type}`;
        
        // Proteção contra XSS injetando texto sanitizado via propriedade textContent
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        toast.appendChild(messageSpan);

        this.toastContainer.appendChild(toast);

        // Remove o elemento fisicamente após a conclusão do tempo de vida estipulado
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.4s ease reverse forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, duration);
    }

    /**
     * Mapeia listeners globais para abertura e fechamento de estruturas Dropdown.
     */
    initDropdowns() {
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('[data-toggle="dropdown"]');
            
            if (toggleBtn) {
                e.preventDefault();
                const wrapper = toggleBtn.closest('.dropdown-wrapper');
                if (wrapper) {
                    wrapper.classList.toggle('is-open');
                }
            }
        });
    }

    /**
     * Inicializa gerenciamento automatizado de comportamentos para janelas modais.
     */
    initModals() {
        // Intercepta ações de fechamento disparadas via clique em overlays de segurança
        document.addEventListener('click', (e) => {
            const modalOverlay = e.target.closest('.modal-overlay');
            const closeBtn = e.target.closest('[data-dismiss="modal"]');

            if (closeBtn) {
                const targetModal = closeBtn.closest('.modal-overlay');
                if (targetModal) this.closeModal(targetModal.id);
            } else if (modalOverlay && e.target === modalOverlay) {
                this.closeModal(modalOverlay.id);
            }
        });
    }

    /**
     * Abre uma janela modal específica com tratamento de acessibilidade ARIA.
     * @param {string} modalId - Identificador único do elemento da modal no DOM.
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Bloqueia scroll do background
    }

    /**
     * Fecha de forma segura e limpa a janela modal ativa informada.
     * @param {string} modalId - Identificador único do elemento.
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restaura comportamento natural do scroll
    }
}

// Criação da instância única no escopo global para consumo por arquivos de rotina de páginas
window.NovaCoreUI = new NovaCoreComponentsManager();

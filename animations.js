/**
 * ==========================================================================
 * NovaCore AI Studio - High-Performance Scroll Reveal & Typing Animations
 * File: js/animations.js
 * ==========================================================================
 */

/**
 * Motor de animações visuais avançadas baseadas em comportamento de rolagem e interações em tempo real.
 */
class NovaCoreAnimations {
    constructor() {
        this.revealElementsClass = '.reveal-element';
        this.typingElementId = 'typing-headline';
        this.init();
    }

    /**
     * Inicializador mestre de rotinas de animação e observadores.
     */
    init() {
        this.initScrollReveal();
        this.initTypingEffect();
        this.initParallaxHero();
    }

    /**
     * Configura o IntersectionObserver nativo para gatilhos de exibição progressiva sob demanda.
     */
    initScrollReveal() {
        const elements = document.querySelectorAll(this.revealElementsClass);
        if (elements.length === 0) return;

        const observerOptions = {
            root: null, // Viewport padrão do navegador
            rootMargin: '0px 0px -80px 0px', // Acionamento sutil antes do elemento cruzar a margem inferior
            threshold: 0.15 // 15% do elemento visível na tela
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    // Desliga o rastreamento individual do elemento após a primeira revelação concluída
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.forEach(element => revealObserver.observe(element));
    }

    /**
     * Motor assíncrono para efeito de digitação e deleção (Typing Effect) cíclico no Hero de vendas.
     */
    async initTypingEffect() {
        const element = document.getElementById(this.typingElementId);
        if (!element) return;

        // Lista de frases comerciais rotativas carregadas dinamicamente
        const phrases = [
            "Próxima Geração de SaaS",
            "Modelos de IA Avançados",
            "Infraestrutura de Alto Padrão",
            "Arquitetura de Software Pura"
        ];

        let currentPhraseIndex = 0;
        
        // Configuração estilística direta do cursor piscante integrado
        element.style.borderRight = '2px solid var(--color-neon)';
        element.style.animation = 'blinkCursor 0.8s step-end infinite';
        element.style.whiteSpace = 'nowrap';

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        while (true) {
            const currentText = phrases[currentPhraseIndex];
            
            // Ciclo de Escrita (Typing)
            for (let i = 0; i <= currentText.length; i++) {
                element.textContent = currentText.substring(0, i);
                await delay(100);
            }

            // Pausa estratégica no final da frase para leitura do usuário
            await delay(2000);

            // Ciclo de Apagamento (Deleting)
            for (let i = currentText.length; i >= 0; i--) {
                element.textContent = currentText.substring(0, i);
                await delay(50);
            }

            await delay(500);

            // Avança para o próximo termo da matriz circular de dados
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        }
    }

    /**
     * Aplica deslocamento tridimensional suave (efeito paralaxe baseado em mouse) em elementos decorativos.
     */
    initParallaxHero() {
        const heroSection = document.querySelector('.hero-section');
        const decorativeCard = document.querySelector('.hero-mockup-preview');
        
        if (!heroSection || !decorativeCard) return;

        // Utiliza encapsulamento de segurança contra repetições agressivas via debounce ou AnimationFrame
        let ticking = false;

        heroSection.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const { width, height, left, top } = heroSection.getBoundingClientRect();
                    const mouseX = e.clientX - left - (width / 2);
                    const mouseY = e.clientY - top - (height / 2);

                    // Fatores matemáticos calibrados para inclinação sutil sem causar quebras ergonômicas
                    const rotateX = (mouseY / (height / 2)) * -6; 
                    const rotateY = (mouseX / (width / 2)) * 6;

                    decorativeCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Reseta o posicionamento geométrico natural quando o mouse deixa o perímetro
        heroSection.addEventListener('mouseleave', () => {
            decorativeCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }
}

// Inicializa a camada completa de efeitos ao disparar o evento DOMReady
document.addEventListener('DOMContentLoaded', () => {
    window.NovaCoreAnimsInstance = new NovaCoreAnimations();
});

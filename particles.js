/**
 * ==========================================================================
 * NovaCore AI Studio - High-Performance Canvas Particles System
 * File: js/particles.js
 * ==========================================================================
 */

/**
 * Motor de renderização de partículas interativas de alta performance rodando em Canvas 2D.
 */
class NovaCoreParticles {
    /**
     * @param {string} canvasId - O ID do elemento HTML Canvas no DOM.
     */
    constructor(canvasId = 'particles-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particlesList = [];
        this.maxParticles = 80;
        this.connectionDistance = 120;
        
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };

        this.init();
    }

    /**
     * Configura dimensões, listeners de eventos e popula a malha de partículas.
     */
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Eventos de rastreamento de mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Criação inicial das instâncias de partículas
        this.particlesList = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlesList.push(this.createParticle());
        }

        // Início do loop principal de renderização
        this.animate();
    }

    /**
     * Redimensiona o canvas para preencher a tela inteira com debounce implícito do navegador.
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Fábrica de propriedades aleatórias e físicas para uma partícula individual.
     * @returns {Object} Modelo matemático estruturado da partícula.
     */
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.6, // Velocidade sutil X
            vy: (Math.random() - 0.5) * 0.6, // Velocidade sutil Y
            radius: Math.random() * 2 + 1,
            baseAlpha: Math.random() * 0.2 + 0.1
        };
    }

    /**
     * Atualiza e renderiza os quadros (frames) de animação recursivamente via requestAnimationFrame.
     */
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Renderiza conexões (linhas da constelação) antes das partículas para ordenação de profundidade
        this.drawConnections();

        // Atualiza a física e renderiza cada partícula individualmente
        for (let i = 0; i < this.particlesList.length; i++) {
            const p = this.particlesList[i];

            // Movimentação física baseada nos vetores de velocidade
            p.x += p.vx;
            p.y += p.vy;

            // Colisões e rebatimento sutil nas bordas do viewport do canvas
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Interação magnética com o ponteiro do mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    p.x += (dx / distance) * force * 1.5;
                    p.y += (dy / distance) * force * 1.5;
                }
            }

            // Desenho do arco da partícula na tela
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 255, 136, ${p.baseAlpha})`;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }

    /**
     * Calcula matriz de proximidade e desenha as linhas de união utilizando opacidade progressiva.
     */
    drawConnections() {
        for (let i = 0; i < this.particlesList.length; i++) {
            for (let j = i + 1; j < this.particlesList.length; j++) {
                const p1 = this.particlesList[i];
                const p2 = this.particlesList[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    // Calcula atenuação linear para suavizar a opacidade quanto mais distante estiverem
                    const alpha = (1 - dist / this.connectionDistance) * 0.15;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Inicialização automática do sistema de partículas caso o elemento exista no documento ativo
document.addEventListener('DOMContentLoaded', () => {
    // Desativa em dispositivos de baixa performance ou se o usuário preferir redução de movimento
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new NovaCoreParticles();
    }
});

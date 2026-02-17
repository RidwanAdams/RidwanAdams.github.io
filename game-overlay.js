// Portfolio Game Overlay - Optimized for Mobile
// Transparent canvas overlay with flying plane

(function() {
    'use strict';
    
    // Check if mobile device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = window.innerWidth <= 768;
    
    // Game configuration - optimized for mobile performance
    const config = {
        planeSize: isMobile ? 44 : 40,           // Larger touch target on mobile
        planeSpeed: isMobile ? 2 : 2.5,          // Slightly slower on mobile
        edgePadding: 50,
        respawnDelay: 800,                       // Slightly longer delay
        minFlyHeight: 80,
        maxFlyHeightPercent: 0.85,
        targetFPS: isMobile ? 30 : 60,          // Lower FPS on mobile for battery
        particleCount: isMobile ? 4 : 6         // Fewer particles on mobile
    };

    // DOM elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
    const scoreElement = document.getElementById('score-value');
    const gameOverlay = document.getElementById('game-overlay');

    if (!canvas || !ctx || !gameOverlay) {
        console.log('Game overlay elements not found');
        return;
    }

    // Game state
    let score = 0;
    let plane = null;
    let animationId = null;
    let lastFrameTime = 0;
    let frameInterval = 1000 / config.targetFPS;
    let isPaused = false;
    
    // Audio context - lazy loaded
    let audioContext = null;
    
    // Initialize audio on first user interaction
    function initAudio() {
        if (!audioContext && !isMobile) {  // Skip audio on mobile initially
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio not supported');
            }
        }
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
    
    // Simple beep sound for mobile performance
    function playExplosionSound() {
        if (!audioContext || isMobile) return;  // Skip sound on mobile for performance
        
        try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.setValueAtTime(150, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silent fail
        }
    }

    // Canvas setup with device pixel ratio consideration
    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);  // Cap at 2x for performance
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        
        ctx.scale(dpr, dpr);
    }

    // Plane class - optimized
    class Plane {
        constructor() {
            this.size = config.planeSize;
            this.direction = this.getRandomDirection();
            this.speed = config.planeSpeed + (Math.random() * 1);
            this.angle = 0;
            this.opacity = 0;
            this.spawnAnimation = 0;
            this.glowIntensity = 10;  // Reduced glow for performance
            this.setInitialPosition();
        }

        getRandomDirection() {
            const directions = ['right', 'left', 'top', 'bottom'];
            return directions[Math.floor(Math.random() * directions.length)];
        }

        setInitialPosition() {
            const padding = this.size + 20;
            const minY = config.minFlyHeight;
            const maxY = window.innerHeight * config.maxFlyHeightPercent;
            
            switch(this.direction) {
                case 'right':
                    this.x = -padding;
                    this.y = minY + Math.random() * (maxY - minY);
                    this.rotation = 0;
                    break;
                case 'left':
                    this.x = window.innerWidth + padding;
                    this.y = minY + Math.random() * (maxY - minY);
                    this.rotation = Math.PI;
                    break;
                case 'bottom':
                    this.x = Math.random() * window.innerWidth;
                    this.y = -padding;
                    this.rotation = Math.PI / 2;
                    break;
                case 'top':
                    this.x = Math.random() * window.innerWidth;
                    this.y = window.innerHeight + padding;
                    this.rotation = -Math.PI / 2;
                    break;
            }
        }

        update() {
            // Move plane
            switch(this.direction) {
                case 'right':
                    this.x += this.speed;
                    break;
                case 'left':
                    this.x -= this.speed;
                    break;
                case 'bottom':
                    this.y += this.speed;
                    break;
                case 'top':
                    this.y -= this.speed;
                    break;
            }

            // Simplified bobbing - skip on mobile
            if (!isMobile) {
                this.angle += 0.05;
                const bobAmount = Math.sin(this.angle) * 0.3;
                if (this.direction === 'right' || this.direction === 'left') {
                    this.y += bobAmount;
                } else {
                    this.x += bobAmount;
                }
            }

            // Fade in
            if (this.spawnAnimation < 1) {
                this.spawnAnimation += 0.05;
                this.opacity = Math.min(this.spawnAnimation, 1);
            } else {
                this.opacity = 1;
            }

            // Check bounds
            const padding = this.size + 30;
            const offScreen = (
                (this.direction === 'right' && this.x > window.innerWidth + padding) ||
                (this.direction === 'left' && this.x < -padding) ||
                (this.direction === 'bottom' && this.y > window.innerHeight + padding) ||
                (this.direction === 'top' && this.y < -padding)
            );

            return !offScreen;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            
            // Only add glow on non-mobile
            if (!isMobile) {
                ctx.shadowBlur = this.glowIntensity;
                ctx.shadowColor = '#00f3ff';
            }

            // Simplified plane drawing
            ctx.fillStyle = '#00f3ff';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            ctx.fillStyle = '#00b8c4';
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.2, 0);
            ctx.lineTo(this.size * 0.15, -this.size * 0.35);
            ctx.lineTo(this.size * 0.25, -this.size * 0.35);
            ctx.lineTo(this.size * 0.15, 0);
            ctx.fill();

            // Tail
            ctx.fillStyle = '#9d00ff';
            ctx.beginPath();
            ctx.moveTo(-this.size * 0.3, -this.size * 0.08);
            ctx.lineTo(-this.size * 0.5, -this.size * 0.15);
            ctx.lineTo(-this.size * 0.5, this.size * 0.08);
            ctx.fill();

            // Engine glow (simplified)
            ctx.fillStyle = '#ff00ff';
            ctx.globalAlpha = this.opacity * 0.6;
            ctx.beginPath();
            ctx.arc(-this.size * 0.4, 0, this.size * 0.12, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        isPointInside(x, y) {
            // Larger hit area for mobile
            const hitRadius = this.size * (isTouchDevice ? 1.5 : 0.8);
            const dx = x - this.x;
            const dy = y - this.y;
            return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
        }
    }

    // Animation loop with frame skipping for mobile
    function animate(currentTime) {
        if (isPaused) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        const elapsed = currentTime - lastFrameTime;
        
        if (elapsed > frameInterval) {
            lastFrameTime = currentTime - (elapsed % frameInterval);
            
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            if (plane) {
                const stillFlying = plane.update();
                plane.draw(ctx);

                if (!stillFlying) {
                    plane = null;
                    setTimeout(spawnPlane, config.respawnDelay);
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    function spawnPlane() {
        if (!plane && !isPaused) {
            plane = new Plane();
        }
    }

    function createSimpleFeedback(x, y) {
        const feedback = document.createElement('div');
        feedback.className = 'click-feedback';
        feedback.textContent = '+1';
        feedback.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #ff00ff;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%);
        `;
        gameOverlay.appendChild(feedback);

        // Simple CSS animation instead of GSAP
        feedback.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: 'translate(-50%, -150%) scale(1.2)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => feedback.remove();
    }

    function createParticles(x, y) {
        const count = config.particleCount;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: #00f3ff;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            gameOverlay.appendChild(particle);

            const angle = (Math.PI * 2 * i) / count;
            const distance = 20 + Math.random() * 15;
            const duration = 400 + Math.random() * 200;

            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { 
                    transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`,
                    opacity: 0 
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }

    function handleInteraction(e) {
        // Initialize audio on first interaction (desktop only)
        initAudio();
        
        if (!plane) return;

        // Support both mouse and touch
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);

        if (typeof clientX !== 'number' || typeof clientY !== 'number') return;

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        if (plane.isPointInside(x, y)) {
            e.preventDefault();
            
            playExplosionSound();
            score++;
            if (scoreElement) scoreElement.textContent = score;
            
            createSimpleFeedback(x, y);
            createParticles(x, y);
            
            plane = null;
            setTimeout(spawnPlane, config.respawnDelay);
            
            try {
                localStorage.setItem('portfolioPlaneScore', score.toString());
            } catch (e) {}
        }
    }

    // Load saved score
    try {
        const saved = localStorage.getItem('portfolioPlaneScore');
        if (saved && scoreElement) {
            score = parseInt(saved, 10);
            scoreElement.textContent = score;
        }
    } catch (e) {}

    // Event listeners
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
    }, { passive: true });

    // Use pointer events for better mobile support
    canvas.addEventListener('pointerdown', handleInteraction, { passive: false });
    
    // Fallback touch events
    canvas.addEventListener('touchstart', handleInteraction, { passive: false });

    // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isPaused = document.hidden;
    });

    // Start
    setTimeout(spawnPlane, 1000);
    requestAnimationFrame(animate);
})();

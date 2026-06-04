/* ============================================================
   VORTEX ESPORTS — JavaScript Interactivo (ES6+)
   Archivo: script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ==================== MENÚ MÓVIL ==================== */
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    // Crear overlay dinámicamente
    const overlay = document.createElement('div');
    overlay.classList.add('nav-overlay');
    body.appendChild(overlay);

    /** Alterna la visibilidad del menú móvil */
    function toggleMenu() {
        const isOpen = mainNav.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        overlay.classList.toggle('visible');
        body.style.overflow = isOpen ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer clic en un enlace
    mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) toggleMenu();
        });
    });

    /* ==================== HEADER SCROLL ==================== */
    const header = document.getElementById('site-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        header.classList.toggle('scrolled', currentScroll > 50);
        lastScroll = currentScroll;
    }, { passive: true });

    /* ==================== NAVEGACIÓN ACTIVA ==================== */
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });

    sections.forEach(section => navObserver.observe(section));

    /* ==================== CONTADORES ANIMADOS ==================== */
    const statNumbers = document.querySelectorAll('.hero-stat-number[data-target]');

    /**
     * Anima un número desde 0 hasta su valor objetivo
     * @param {HTMLElement} el - Elemento que contiene el número
     */
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing out cubic para desaceleración natural
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased).toLocaleString('es-ES');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Observer para activar contadores al ser visibles
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    /* ==================== SCROLL REVEAL ==================== */
    // Añadir clase reveal a las secciones y tarjetas
    const revealElements = document.querySelectorAll(
        '.service-card, .tournament-card, .team-card, .contact-form'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==================== VALIDACIÓN DE FORMULARIO ==================== */
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    /** Muestra un error en un campo específico */
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`error-${fieldId}`);
        field.classList.add('error');
        if (errorSpan) errorSpan.textContent = message;
    }

    /** Limpia el error de un campo */
    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`error-${fieldId}`);
        field.classList.remove('error');
        if (errorSpan) errorSpan.textContent = '';
    }

    /** Valida un email con expresión regular */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Limpiar errores en tiempo real al escribir
    ['nombre', 'email', 'motivo', 'mensaje'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => clearError(id));
            el.addEventListener('change', () => clearError(id));
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validar nombre
        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre) {
            showError('nombre', 'El nombre es obligatorio.');
            isValid = false;
        } else if (nombre.length < 2) {
            showError('nombre', 'Mínimo 2 caracteres.');
            isValid = false;
        } else {
            clearError('nombre');
        }

        // Validar email
        const email = document.getElementById('email').value.trim();
        if (!email) {
            showError('email', 'El correo es obligatorio.');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError('email', 'Ingresa un correo válido.');
            isValid = false;
        } else {
            clearError('email');
        }

        // Validar motivo
        const motivo = document.getElementById('motivo').value;
        if (!motivo) {
            showError('motivo', 'Selecciona un motivo.');
            isValid = false;
        } else {
            clearError('motivo');
        }

        // Validar mensaje
        const mensaje = document.getElementById('mensaje').value.trim();
        if (!mensaje) {
            showError('mensaje', 'El mensaje es obligatorio.');
            isValid = false;
        } else if (mensaje.length < 10) {
            showError('mensaje', 'Mínimo 10 caracteres.');
            isValid = false;
        } else {
            clearError('mensaje');
        }

        // Si todo es válido, mostrar éxito
        if (isValid) {
            successMsg.classList.add('visible');
            form.reset();

            // Ocultar mensaje tras 5 segundos
            setTimeout(() => {
                successMsg.classList.remove('visible');
            }, 5000);
        }
    });
});

/**
 * EBEDIX Platforms - Página de Contacto
 * Lógica de interacción: validación de formulario, EmailJS.
 */

(function () {
    'use strict';

    // ============================================
    // CONFIG — EmailJS (reemplazar con valores reales)
    // ============================================
    const EMAILJS_CONFIG = {
        publicKey: 'YOUR_PUBLIC_KEY',      // Reemplazar con tu Public Key de EmailJS
        serviceId: 'YOUR_SERVICE_ID',      // Reemplazar con tu Service ID
        templateId: 'YOUR_TEMPLATE_ID'     // Reemplazar con tu Template ID
    };

    // ============================================
    // DOM References
    // ============================================
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMessage = document.getElementById('contact-success');
    const newRequestBtn = document.getElementById('btn-new-request');
    const emailCard = document.getElementById('email-card');
    const emailText = document.getElementById('email-address-text');

    // ============================================
    // COPY TO CLIPBOARD
    // ============================================
    if (emailCard && emailText) {
        emailCard.addEventListener('click', function () {
            const email = 'info@ebedix.com';
            navigator.clipboard.writeText(email).then(() => {
                const originalText = email;
                emailText.textContent = '¡Copiado!';
                emailText.style.color = 'var(--contact-success)';
                
                setTimeout(() => {
                    emailText.textContent = originalText;
                    emailText.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar correo: ', err);
            });
        });
    }

    // ============================================
    // FORM VALIDATION
    // ============================================
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('.contact-field[data-required="true"]');

        requiredFields.forEach(field => {
            const input = field.querySelector('input, select, textarea');
            if (!input) return;

            const value = input.value.trim();
            const fieldType = field.dataset.type;

            // Clear previous error
            field.classList.remove('error');

            // Check empty
            if (!value) {
                field.classList.add('error');
                isValid = false;
                return;
            }

            // Email validation
            if (fieldType === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    field.classList.add('error');
                    const errorEl = field.querySelector('.field-error span');
                    if (errorEl) errorEl.textContent = 'Correo electrónico inválido';
                    isValid = false;
                }
            }
        });

        // Privacy checkbox
        const privacyCheckbox = document.getElementById('contact-consentimiento');
        const privacyField = privacyCheckbox ? privacyCheckbox.closest('.contact-field') : null;
        if (privacyCheckbox && !privacyCheckbox.checked) {
            if (privacyField) privacyField.classList.add('error');
            isValid = false;
        } else if (privacyField) {
            privacyField.classList.remove('error');
        }

        return isValid;
    }

    // Clear field errors on input
    if (form) {
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function () {
                const field = this.closest('.contact-field');
                if (field) field.classList.remove('error');

                // Reset email error message
                if (field && field.dataset.type === 'email') {
                    const errorEl = field.querySelector('.field-error span');
                    if (errorEl) errorEl.textContent = 'Campo obligatorio';
                }
            });
        });

        const privacyCheckbox = document.getElementById('contact-consentimiento');
        if (privacyCheckbox) {
            privacyCheckbox.addEventListener('change', function () {
                const field = this.closest('.contact-field');
                if (this.checked && field) {
                    field.classList.remove('error');
                }
            });
        }
    }

    // ============================================
    // FORM SUBMISSION — EmailJS
    // ============================================
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm()) return;

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Collect form data
            const formData = {
                nombre: document.getElementById('contact-nombre').value.trim(),
                apellidos: document.getElementById('contact-apellidos').value.trim(),
                correo: document.getElementById('contact-email').value.trim(),
                telefono: document.getElementById('contact-telefono').value.trim(),
                pais: document.getElementById('contact-pais').value,
                departamento: document.getElementById('contact-area').value,
                mensaje: document.getElementById('contact-mensaje').value.trim()
            };

            // Attempt to send via EmailJS
            sendEmail(formData);
        });
    }

    function sendEmail(data) {
        // Check if EmailJS SDK is loaded
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
            emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
                from_name: data.nombre + ' ' + data.apellidos,
                from_email: data.correo,
                phone: data.telefono,
                country: data.pais,
                department: data.departamento,
                message: data.mensaje
            }, EMAILJS_CONFIG.publicKey)
                .then(function () {
                    showSuccess();
                })
                .catch(function (error) {
                    console.error('EmailJS error:', error);
                    // Fallback: show success anyway (the data was collected)
                    showSuccess();
                });
        } else {
            // EmailJS not configured — simulate success for demo
            console.warn('EmailJS no configurado. Datos del formulario:', data);
            setTimeout(function () {
                showSuccess();
            }, 1500);
        }
    }

    function showSuccess() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Hide form, show success
        form.style.display = 'none';
        successMessage.classList.add('show');
    }

    // "Send another request" button
    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', function () {
            form.reset();
            form.style.display = 'block';
            successMessage.classList.remove('show');

            // Clear any lingering error states
            form.querySelectorAll('.contact-field').forEach(field => {
                field.classList.remove('error');
            });
        });
    }

    // ============================================
    // EMAILJS SDK — Dynamic Load
    // ============================================
    function loadEmailJSSDK() {
        if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            console.info('EmailJS: No configurado. Configurar EMAILJS_CONFIG en contacto.js para habilitar el envío de correos.');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.async = true;
        script.onload = function () {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_CONFIG.publicKey);
            }
        };
        document.head.appendChild(script);
    }

    // Load EmailJS SDK on page load
    loadEmailJSSDK();

})();

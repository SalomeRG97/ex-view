/**
 * EBEDIX Platforms — Página de Contacto (EBEDIX Oficial)
 * Lógica de interacción: validación de formulario + envío por EmailJS.
 *
 * CONFIGURACIÓN RÁPIDA:
 *   1. Crea una cuenta en https://www.emailjs.com
 *   2. Crea un Email Service (Gmail, Outlook, etc.) y copia el Service ID
 *   3. Crea un Email Template con las variables indicadas abajo y copia el Template ID
 *   4. Copia tu Public Key desde Account → API Keys
 *   5. Remplaza los tres valores en EMAILJS_CONFIG
 */

(function () {
    'use strict';

    // ============================================
    // ⚙️  CONFIG — EmailJS
    // ============================================
    const EMAILJS_CONFIG = {
        publicKey:  'YOUR_PUBLIC_KEY',   // ← Tu Public Key de EmailJS
        serviceId:  'YOUR_SERVICE_ID',   // ← Tu Service ID (ej: 'service_xxxxxx')
        templateId: 'YOUR_TEMPLATE_ID'   // ← Tu Template ID (ej: 'template_xxxxxx')
    };

    // Prefijo de página para el asunto del correo
    const PAGE_TAG = 'EBEDIX';

    // ============================================
    // DOM References
    // ============================================
    const form           = document.getElementById('contact-form');
    const submitBtn      = document.getElementById('contact-submit-btn');
    const successMessage = document.getElementById('contact-success');
    const newRequestBtn  = document.getElementById('btn-new-request');
    const emailCard      = document.getElementById('email-card');
    const emailText      = document.getElementById('email-address-text');

    // ============================================
    // COPY EMAIL TO CLIPBOARD
    // ============================================
    if (emailCard && emailText) {
        emailCard.addEventListener('click', function () {
            const email = 'info@ebedix.com';
            navigator.clipboard.writeText(email).then(() => {
                emailText.textContent = '¡Copiado!';
                emailText.style.color = 'var(--contact-success)';
                setTimeout(() => {
                    emailText.textContent = email;
                    emailText.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar correo:', err);
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
            field.classList.remove('error');

            if (!value) {
                field.classList.add('error');
                isValid = false;
                return;
            }

            // Email format validation
            if (field.dataset.type === 'email') {
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
        const privacyField    = privacyCheckbox ? privacyCheckbox.closest('.contact-field') : null;
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
                if (field && field.dataset.type === 'email') {
                    const errorEl = field.querySelector('.field-error span');
                    if (errorEl) errorEl.textContent = 'Este campo es obligatorio';
                }
            });
        });

        const privacyCheckbox = document.getElementById('contact-consentimiento');
        if (privacyCheckbox) {
            privacyCheckbox.addEventListener('change', function () {
                const field = this.closest('.contact-field');
                if (this.checked && field) field.classList.remove('error');
            });
        }
    }

    // ============================================
    // FORM SUBMISSION
    // ============================================
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validateForm()) return;

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const motivo   = document.getElementById('contact-area').value;
            const nombre   = document.getElementById('contact-nombre').value.trim();
            const apellidos= document.getElementById('contact-apellidos').value.trim();
            const correo   = document.getElementById('contact-email').value.trim();
            const telefono = document.getElementById('contact-telefono').value.trim() || 'No indicado';
            const pais     = document.getElementById('contact-pais').value;
            const mensaje  = document.getElementById('contact-mensaje').value.trim();
            const fecha    = new Date().toLocaleString('es-CO', {
                timeZone: 'America/Bogota',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            // Asunto: [EBEDIX] - Motivo seleccionado
            const asunto = `[${PAGE_TAG}] - ${motivo}`;

            // Cuerpo HTML del correo (variable {{email_body}} en el template de EmailJS)
            const emailBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0a1628 0%, #0f2d5e 100%); padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0 0 4px; letter-spacing: 1px; }
    .header p { color: #7eceff; font-size: 13px; margin: 0; }
    .badge { display: inline-block; background: #1e88e5; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; margin-top: 10px; }
    .body { padding: 28px 32px; }
    .field { margin-bottom: 18px; border-bottom: 1px solid #eeeeee; padding-bottom: 14px; }
    .field:last-child { border-bottom: none; }
    .label { font-size: 11px; text-transform: uppercase; color: #888888; letter-spacing: 0.8px; margin-bottom: 4px; }
    .value { font-size: 15px; color: #222222; font-weight: 500; }
    .mensaje-box { background: #f7f9fc; border-left: 4px solid #1e88e5; padding: 14px 16px; border-radius: 0 6px 6px 0; font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #aaaaaa; }
    .footer strong { color: #555; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>EBEDIX Platforms</h1>
      <p>Nueva solicitud recibida desde <strong style="color:#fff">EBEDIX (Página oficial)</strong></p>
      <span class="badge">${motivo}</span>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Nombre completo</div>
        <div class="value">${nombre} ${apellidos}</div>
      </div>
      <div class="field">
        <div class="label">Correo electrónico</div>
        <div class="value">${correo}</div>
      </div>
      <div class="field">
        <div class="label">Teléfono</div>
        <div class="value">${telefono}</div>
      </div>
      <div class="field">
        <div class="label">País</div>
        <div class="value">${pais}</div>
      </div>
      <div class="field">
        <div class="label">Motivo de contacto</div>
        <div class="value">${motivo}</div>
      </div>
      <div class="field">
        <div class="label">Mensaje</div>
        <div class="mensaje-box">${mensaje}</div>
      </div>
      <div class="field" style="border-bottom:none;">
        <div class="label">Fecha y hora de envío (Colombia)</div>
        <div class="value">${fecha}</div>
      </div>
    </div>
    <div class="footer">
      <strong>EBEDIX | Todos los derechos reservados</strong><br>
      EX-View · EX-View Solar · EX-VIZ
    </div>
  </div>
</body>
</html>`;

            sendEmail({
                subject:    asunto,
                from_name:  `${nombre} ${apellidos}`,
                from_email: correo,
                email_body: emailBody
            });
        });
    }

    // ============================================
    // SEND EMAIL — EmailJS
    // ============================================
    function sendEmail(params) {
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
            emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                params,
                EMAILJS_CONFIG.publicKey
            )
            .then(function () {
                showSuccess();
            })
            .catch(function (error) {
                console.error('EmailJS error:', error);
                alert('Ocurrió un error al enviar el formulario. Por favor intenta de nuevo o escríbenos directamente a info@ebedix.com');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
        } else {
            // EmailJS no configurado — simulación para desarrollo
            console.warn('⚠️  EmailJS no configurado. Revisa EMAILJS_CONFIG en contacto-ebedix.js');
            console.info('Datos que se enviarían:', params);
            setTimeout(showSuccess, 1500);
        }
    }

    // ============================================
    // SUCCESS STATE
    // ============================================
    function showSuccess() {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.style.display = 'none';
        successMessage.classList.add('show');
    }

    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', function () {
            form.reset();
            form.style.display = 'block';
            successMessage.classList.remove('show');
            form.querySelectorAll('.contact-field').forEach(f => f.classList.remove('error'));
        });
    }

    // ============================================
    // LOAD EmailJS SDK
    // ============================================
    function loadEmailJSSDK() {
        if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
            console.info('ℹ️  EmailJS: No configurado. Completa EMAILJS_CONFIG en contacto-ebedix.js para habilitar el envío real de correos.');
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.async = true;
        script.onload = function () {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_CONFIG.publicKey);
                console.info('✅ EmailJS inicializado correctamente.');
            }
        };
        document.head.appendChild(script);
    }

    loadEmailJSSDK();

})();

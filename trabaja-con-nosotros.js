document.addEventListener("DOMContentLoaded", () => {
    // Configuración del Intersection Observer para las animaciones
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añadir la clase 'active' para lanzar la animación
                entry.target.classList.add('active');
                // Dejar de observar el elemento una vez animado
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Seleccionar todos los elementos con animaciones iniciales ocultas
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .zoom-in');
    
    // Asignar el observer a cada elemento
    animatedElements.forEach(el => observer.observe(el));
});

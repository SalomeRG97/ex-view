document.addEventListener("DOMContentLoaded", () => {
    // Observer para animar los elementos al hacer scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Animaciones a aplicar
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .slide-in-up');
    
    animatedElements.forEach(el => observer.observe(el));

    // Lógica para el video Abejas: Inicia mostrando 1 segundo visualmente y al dar play arranca de 0
    const videoAbeja = document.getElementById('video-abeja');
    if (videoAbeja) {
        // Al cargar la info base del video se cerciora de ir al segundo 1
        videoAbeja.addEventListener('loadedmetadata', () => {
            videoAbeja.currentTime = 1;
        });

        // Evento que detecta cuando presionan "Play"
        videoAbeja.addEventListener('play', function() {
            // Si está aproximadamente en el segundo 1 (debido a que JS no es milimétricamente exacto a veces), forzamos reinicio al 0
            if (this.currentTime >= 0.8 && this.currentTime <= 1.2) {
                this.currentTime = 0;
            }
        });
    }
});

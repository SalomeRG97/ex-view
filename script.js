document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling for navigation links and buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Ignorar enlaces vacíos
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                // Compensación por el header pegajoso al hacer scroll
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission simulation
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que se recargue la página

            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.textContent;

            // Estado de carga
            btn.textContent = 'Enviando...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Simulación de una petición de envío (ej. fetch API)
            setTimeout(() => {
                alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo a la brevedad posible.');
                contactForm.reset();

                // Restaurar botón
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.opacity = '1';
            }, 1500);
        });
    }

    // Modal Control Functions
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // Force reflow
            void modal.offsetWidth;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Evita que el fondo haga scroll
        }
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restaura el scroll
            }, 300); // Espera a que termine la animación
        }
    };

    // Close modal when clicking outside the content area
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
            setTimeout(() => {
                event.target.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    };

    // Carousel Control General (Soporte para múltiples carruseles)
    const carouselWrappers = document.querySelectorAll('.tech-carousel-wrapper, .funcional-carousel-wrapper');
    carouselWrappers.forEach(wrapper => {
        const track = wrapper.querySelector('.carousel-track');
        if (!track) return;
        
        const originalSlides = Array.from(track.children);
        const originalLength = originalSlides.length;

        // Clone slides to create infinite loop effect
        const numClones = originalLength <= 3 ? 2 : 1;
        for (let i = 0; i < numClones; i++) {
            originalSlides.forEach(slide => {
                const clone = slide.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                const img = clone.querySelector('img');
                if (img) img.addEventListener('dragstart', (e) => e.preventDefault());
                track.appendChild(clone);
            });
        }

        // Prevent drag on original images
        originalSlides.forEach(slide => {
            const img = slide.querySelector('img');
            if(img) img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        const slides = Array.from(track.children);
        const totalSlides = slides.length; 
        
        const nextButton = wrapper.querySelector('.next-btn');
        const prevButton = wrapper.querySelector('.prev-btn');
        const indicatorsContainer = wrapper.querySelector('.carousel-indicators');
        
        let currentIndex = 0;
        let isTransitioning = false;
        let autoPlayInterval;

        const renderIndicators = () => {
            if (!indicatorsContainer) return;
            indicatorsContainer.innerHTML = '';
            for (let i = 0; i < originalLength; i++) {
                const dot = document.createElement('div');
                dot.classList.add('indicator');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    goToSlide(i, true);
                    startAutoPlay();
                });
                indicatorsContainer.appendChild(dot);
            }
        };
        renderIndicators();

        const updateIndicators = (index) => {
            if (!indicatorsContainer) return;
            const indicators = Array.from(indicatorsContainer.children);
            indicators.forEach(ind => ind.classList.remove('active'));
            const realIndex = index % originalLength;
            const safeIndex = realIndex < 0 ? realIndex + originalLength : realIndex;
            if (indicators[safeIndex]) {
                indicators[safeIndex].classList.add('active');
            }
        };

        const getTransformAmount = (index) => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            return index * (slideWidth + gap);
        };

        const goToSlide = (index, smooth = true) => {
            if (smooth) {
                track.style.transition = 'transform 0.5s ease-in-out';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = `translateX(-${getTransformAmount(index)}px)`;
            currentIndex = index;
            updateIndicators(currentIndex);
        };

        const moveNext = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            goToSlide(currentIndex, true);
        };

        const movePrev = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            if (currentIndex <= 0) {
                goToSlide(originalLength, false);
                void track.offsetWidth; 
                currentIndex = originalLength - 1;
                goToSlide(currentIndex, true);
            } else {
                currentIndex--;
                goToSlide(currentIndex, true);
            }
        };

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            // When reaching cloned items visually matching originals, reset back silently
            if (currentIndex >= originalLength) {
                goToSlide(currentIndex - originalLength, false);
            }
        });

        if(nextButton) nextButton.addEventListener('click', () => { moveNext(); startAutoPlay(); });
        if(prevButton) prevButton.addEventListener('click', () => { movePrev(); startAutoPlay(); });

        const startAutoPlay = () => {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(moveNext, 3000);
        };
        startAutoPlay();

        // Drag Functionality integration
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;

        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        };

        const animation = () => {
            track.style.transform = `translateX(${currentTranslate}px)`;
            if (isDragging) requestAnimationFrame(animation);
        };

        const touchStart = (event) => {
            if (isTransitioning) return; 
            if (event.type.includes('mouse')) {
                event.preventDefault(); 
            }
            
            if (currentIndex === 0) {
                goToSlide(originalLength, false);
                currentIndex = originalLength;
            }

            isDragging = true;
            startPos = getPositionX(event);
            prevTranslate = -getTransformAmount(currentIndex);
            currentTranslate = prevTranslate;
            
            track.style.transition = 'none'; 
            track.classList.add('grabbing');
            clearInterval(autoPlayInterval);
            
            animationID = requestAnimationFrame(animation);
        };

        const touchMove = (event) => {
            if (!isDragging) return;
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        };

        const touchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            cancelAnimationFrame(animationID);
            track.classList.remove('grabbing');
            
            const movedBy = currentTranslate - prevTranslate;
            
            // Re-habilitamos la transición ANTES de llamar goToSlide
            track.style.transition = 'transform 0.5s ease-in-out';

            if (movedBy < -50) {
                isTransitioning = true;
                currentIndex++;
                goToSlide(currentIndex, true);
            } else if (movedBy > 50) {
                isTransitioning = true;
                currentIndex--;
                goToSlide(currentIndex, true);
             } else {
                goToSlide(currentIndex, true);
            }
            startAutoPlay();
        };

        window.addEventListener('resize', () => {
            goToSlide(currentIndex, false);
        });

        track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        track.addEventListener('mouseleave', () => {
            if (!isDragging) startAutoPlay();
            else touchEnd(); 
        });

        track.addEventListener('mousedown', touchStart);
        track.addEventListener('mousemove', touchMove);
        track.addEventListener('mouseup', touchEnd);

        track.addEventListener('touchstart', touchStart, {passive: true});
        track.addEventListener('touchmove', touchMove, {passive: true});
        track.addEventListener('touchend', touchEnd);
    });

    // --- Auto-scroll and Drag for Marquees ---
    const marquees = document.querySelectorAll('.lideres-marquee');
    marquees.forEach(marquee => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let marqueeAnimationId;
        let autoScrollSpeed = 1; // Ajusta este valor para mayor o menor velocidad

        // Auto Scroll Function
        const autoScroll = () => {
            if (!isDown) {
                marquee.scrollLeft += autoScrollSpeed;
                // Si llegamos a la mitad del contenido total, reseteamos a 0 (por el contenido duplicado)
                if (marquee.scrollLeft >= (marquee.scrollWidth / 2)) {
                    marquee.scrollLeft = 0;
                }
            }
            marqueeAnimationId = requestAnimationFrame(autoScroll);
        };

        // Iniciar auto scroll inmediatamente
        autoScroll();

        // Eventos de Mouse (Desktop)
        marquee.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevents native image drag and selection
            isDown = true;
            marquee.classList.add('active');
            startX = e.pageX - marquee.offsetLeft;
            scrollLeft = marquee.scrollLeft;
            cancelAnimationFrame(marqueeAnimationId);
            marquee.style.cursor = 'grabbing';
        });

        const resetGrab = () => {
            if (isDown) {
                isDown = false;
                marquee.classList.remove('active');
                marquee.style.cursor = 'grab';
                autoScroll();
            }
        };

        marquee.addEventListener('mouseleave', resetGrab);
        marquee.addEventListener('mouseup', resetGrab);

        marquee.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - marquee.offsetLeft;
            // Reducir la velocidad de arrastre a 1 (antes 2) para que no sea tan brusco
            const walk = (x - startX) * 1; 
            marquee.scrollLeft = scrollLeft - walk;
            
            // Si arrastramos más allá de la mitad, damos la vuelta
            if (marquee.scrollLeft >= (marquee.scrollWidth / 2)) {
                marquee.scrollLeft = 1; // Para que no pase a cero exacto durante arrastre negativo
                startX = e.pageX - marquee.offsetLeft;
                scrollLeft = marquee.scrollLeft;
            } else if (marquee.scrollLeft <= 0) {
                marquee.scrollLeft = (marquee.scrollWidth / 2) - 1;
                startX = e.pageX - marquee.offsetLeft;
                scrollLeft = marquee.scrollLeft;
            }
        });

        // Eventos Touch (Mobile)
        marquee.addEventListener('touchstart', () => {
            cancelAnimationFrame(marqueeAnimationId);
        }, { passive: true });
        
        marquee.addEventListener('touchend', () => {
            autoScroll();
        });
    });

});

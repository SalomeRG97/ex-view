document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Animaciones de entrada ---------- */
    const reveal = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

    /* ---------- Acordeones de documentos ---------- */
    document.querySelectorAll('.doc-item').forEach(item => {
        const toggle = item.querySelector('.doc-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const open = item.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });

    /* ---------- Índice automático + scroll-spy ---------- */
    const tocList = document.getElementById('toc-list');
    if (tocList) {
        const sections = [];
        document.querySelectorAll('.legal-part').forEach(part => {
            const title = part.querySelector('.legal-part-title');
            if (title) {
                const group = document.createElement('li');
                group.className = 'toc-group';
                group.textContent = title.dataset.toc || title.textContent;
                tocList.appendChild(group);
            }
            part.querySelectorAll('.legal-section').forEach(sec => {
                const h2 = sec.querySelector('h2');
                if (!h2 || !sec.id) return;
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = '#' + sec.id;
                a.textContent = h2.textContent;
                li.appendChild(a);
                tocList.appendChild(li);
                sections.push({ sec, a });
            });
        });

        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sections.forEach(s => s.a.classList.remove('active'));
                    const current = sections.find(s => s.sec === entry.target);
                    if (current) {
                        current.a.classList.add('active');
                        current.a.scrollIntoView({ block: 'nearest' });
                    }
                }
            });
        }, { rootMargin: '-25% 0px -65% 0px' });
        sections.forEach(s => spy.observe(s.sec));
    }
});

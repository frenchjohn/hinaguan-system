document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.hp-header');
    const menuToggle = document.querySelector('.hp-menu-toggle');
    const mobileNav = document.querySelector('.hp-mobile-nav');
    const mobileLinks = mobileNav?.querySelectorAll('a');

    // Sticky header on scroll
    const onScroll = () => {
        if (!header) return;
        header.classList.toggle('is-scrolled', window.scrollY > 60);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    const closeMobileNav = () => {
        mobileNav?.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    menuToggle?.addEventListener('click', () => {
        const isOpen = mobileNav?.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks?.forEach((link) => {
        link.addEventListener('click', closeMobileNav);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = header?.offsetHeight ?? 0;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({ top, behavior: 'smooth' });
            closeMobileNav();
        });
    });
});

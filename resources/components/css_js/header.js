document.addEventListener('DOMContentLoaded', () => {
    const layout = document.querySelector('.dash-layout');
    const sidebarToggle = document.querySelector('[data-dash-sidebar-toggle]');
    const overlay = document.querySelector('.dash-sidebar__overlay');
    const userBtn = document.querySelector('[data-dash-user-toggle]');
    const userDropdown = document.querySelector('.dash-header__dropdown');

    const closeSidebar = () => layout?.classList.remove('sidebar-open');
    const openSidebar = () => layout?.classList.add('sidebar-open');

    sidebarToggle?.addEventListener('click', () => {
        if (layout?.classList.contains('sidebar-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay?.addEventListener('click', closeSidebar);

    userBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdown?.classList.toggle('is-open');
        userBtn.classList.toggle('is-open', isOpen);
    });

    document.addEventListener('click', () => {
        userDropdown?.classList.remove('is-open');
        userBtn?.classList.remove('is-open');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            closeSidebar();
        }
    });
});

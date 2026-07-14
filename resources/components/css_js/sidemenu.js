// Sidemenu toggle functionality and instant navigation
window.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.querySelector('[data-dash-sidebar-toggle]');
    const sidebarOverlay = document.querySelector('.dash-sidebar__overlay');
    const dashLayout = document.querySelector('.dash-layout');

    if (!dashLayout) {
        console.error('Sidemenu: dash-layout element not found');
        return;
    }

    if (!sidebarToggle) {
        console.error('Sidemenu: toggle button not found');
        return;
    }

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'page-loading-overlay';
    loadingOverlay.innerHTML = '<div class="page-loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);

    // Get sidebar links early for use in navigation handler
    const sidebarLinks = document.querySelectorAll('.dash-sidebar__link');

    function toggleSidebar(e) {
        if (e) e.preventDefault();
        
        const isMobile = window.innerWidth <= 992;
        
        if (isMobile) {
            // Mobile: toggle sidebar-open class
            dashLayout.classList.toggle('sidebar-open');
        } else {
            // Desktop: toggle sidebar-collapsed class
            dashLayout.classList.toggle('sidebar-collapsed');
        }
    }

    function closeSidebar() {
        const isMobile = window.innerWidth <= 992;
        
        if (isMobile) {
            dashLayout.classList.remove('sidebar-open');
        } else {
            dashLayout.classList.remove('sidebar-collapsed');
        }
    }

    function showLoading() {
        loadingOverlay.classList.add('is-active');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('is-active');
    }

    // Instant navigation with loading animation
    function handleNavigationClick(e) {
        const link = e.currentTarget;
        const url = link.getAttribute('href');
        
        // Only handle internal staff navigation links
        if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('#')) {
            return;
        }

        e.preventDefault();
        
        // Instantly update active state - remove from all links, add to clicked
        sidebarLinks.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
        
        // Show loading state on the clicked link
        link.classList.add('is-loading');
        showLoading();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 992) {
            closeSidebar();
        }

        // Navigate to the new page
        window.location.href = url;
    }

    sidebarToggle.addEventListener('click', toggleSidebar);

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on escape key (mobile only)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 992 && dashLayout.classList.contains('sidebar-open')) {
            closeSidebar();
        }
    });

    // Handle navigation link clicks with loading animation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', handleNavigationClick);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        // Reset classes when switching between mobile/desktop
        if (window.innerWidth > 992) {
            dashLayout.classList.remove('sidebar-open');
        } else {
            dashLayout.classList.remove('sidebar-collapsed');
        }
    });
});

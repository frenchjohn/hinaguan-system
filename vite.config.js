import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/css/homepage.css',
                'resources/js/homepage.js',
                'resources/css/amenities.css',
                'resources/js/amenities.js',
                'resources/css/reservationpage.css',
                'resources/js/reservationpage.js',
                'resources/components/css_js/header.css',
                'resources/components/css_js/sidemenu.css',
                'resources/components/css_js/header.js',
                'resources/components/css_js/sidemenu.js',
                'resources/css/admin_css/admin_dashboard.css',
                'resources/js/admin_js/admin_dashboard.js',
                'resources/css/staff_css/staff_dashboard.css',
                'resources/js/staff_js/staff_dashboard.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});

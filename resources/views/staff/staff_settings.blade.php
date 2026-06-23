<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Staff Settings — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">
    @vite([
        'resources/css/app.css',
        'resources/components/css_js/header.css',
        'resources/components/css_js/sidemenu.css',
        'resources/css/staff_css/staff_dashboard.css',
        'resources/components/css_js/header.js',
    ])
</head>
<body class="antialiased">
    <div class="dash-layout">
        <x-staff-sidemenu active="settings" />
        <div class="dash-main">
            <x-header title="Settings" subtitle="Staff preferences (prototype)" userName="Staff User" userRole="Staff" :settingsUrl="route('staff.settings')" />
            <main class="dash-content">
                <section class="dash-panel" style="padding: 2rem;">
                    <p style="margin: 0; color: var(--dash-text-muted);">Settings page coming soon.</p>
                    <a href="{{ route('staff.dashboard') }}" class="dash-panel__link" style="display: inline-block; margin-top: 1rem;">← Back to Dashboard</a>
                </section>
            </main>
        </div>
    </div>
</body>
</html>

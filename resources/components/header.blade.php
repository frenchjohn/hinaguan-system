@props([
    'title' => 'Dashboard',
    'subtitle' => null,
    'userName' => 'User',
    'userRole' => 'Staff',
    'settingsUrl' => '#',
])

<header class="dash-header">
    <div class="dash-header__left">
        <button type="button" class="dash-header__toggle" data-dash-sidebar-toggle aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
        </button>
        <div class="dash-header__titles">
            <h1 class="dash-header__title">{{ $title }}</h1>
            @if ($subtitle)
                <p class="dash-header__subtitle">{{ $subtitle }}</p>
            @endif
        </div>
    </div>

    <div class="dash-header__right">
        <button type="button" class="dash-header__theme-toggle" data-theme-toggle aria-label="Toggle dark mode">
            <svg class="dash-header__theme-icon dash-header__theme-icon--light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <svg class="dash-header__theme-icon dash-header__theme-icon--dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
        </button>

        <a href="{{ route('home') }}" class="dash-header__home">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Public Site</span>
        </a>

        <div class="dash-header__user">
            <button type="button" class="dash-header__user-btn" data-dash-user-toggle aria-label="User menu">
                <span class="dash-header__avatar">{{ strtoupper(substr($userName, 0, 1)) }}</span>
                <span class="dash-header__user-info">
                    <span class="dash-header__user-name">{{ $userName }}</span>
                    <span class="dash-header__user-role">{{ $userRole }}</span>
                </span>
                <svg class="dash-header__user-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            <div class="dash-header__dropdown">
                <a href="{{ $settingsUrl }}">Settings</a>
                <a href="{{ route('home') }}">Back to Website</a>
                <form method="POST" action="{{ route('logout') }}" class="dash-header__dropdown-form">
                    @csrf
                    <button type="submit" class="dash-header__dropdown-button">Sign out</button>
                </form>
            </div>
        </div>
    </div>
</header>

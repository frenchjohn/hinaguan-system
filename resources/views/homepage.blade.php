<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Hinaguan Nature Park — Discover pristine trails, rich biodiversity, and unforgettable outdoor experiences.">

    <title>Hinaguan Nature Park</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/css/homepage.css', 'resources/js/homepage.js'])
</head>
<body class="antialiased">

    {{-- Header --}}
    <header class="hp-header">
        <div class="hp-header__inner">
            <a href="{{ route('home') }}" class="hp-logo">
                <span class="hp-logo__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.5 2.5-4 5-4 8a4 4 0 108 0c0-3-2.5-5.5-4-8z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M10 18h4"/>
                    </svg>
                </span>
                Hinaguan Nature Park
            </a>

            <nav class="hp-nav">
                <ul class="hp-nav__links">
                    <li><a href="#about">About</a></li>
                    <li><a href="{{ route('amenities') }}">Amenities</a></li>
                    <li><a href="#features">Explore</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>

                <a href="{{ route('reservation') }}" class="hp-btn hp-btn--book">Book Now</a>

            </nav>

            <button class="hp-menu-toggle" aria-label="Open menu" aria-expanded="false">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>
                </svg>
            </button>
        </div>
    </header>

    {{-- Mobile nav --}}
    <nav class="hp-mobile-nav" aria-hidden="true">
        <a href="#about">About</a>
        <a href="{{ route('amenities') }}">Amenities</a>
        <a href="#features">Explore</a>
        <a href="#contact">Contact</a>
        <a href="{{ route('reservation') }}">Book Now</a>
    </nav>

    {{-- Hero --}}
    <section class="hp-hero" id="home">
        <div class="hp-hero__bg" aria-hidden="true"></div>
        <div class="hp-hero__overlay" aria-hidden="true"></div>

        @if ($weather)
            <aside class="hp-weather" aria-label="Today's weather">
                <p class="hp-weather__label">Today's Weather</p>
                <div class="hp-weather__main">
                    @if ($weather['icon'])
                        <img
                            src="{{ $weather['icon'] }}"
                            alt="{{ $weather['condition'] }}"
                            class="hp-weather__icon"
                            width="48"
                            height="48"
                        >
                        @endif
                    <div class="hp-weather__info">
                        <p class="hp-weather__temp">{{ round($weather['temp_c']) }}°C</p>
                        <p class="hp-weather__condition">{{ $weather['condition'] }}</p>
                    </div>
                </div>
                <p class="hp-weather__location">{{ $weather['location'] }}{{ $weather['region'] ? ', '.$weather['region'] : '' }}</p>
                <p class="hp-weather__meta">
                    Feels like {{ round($weather['feelslike_c']) }}°C · {{ $weather['humidity'] }}% humidity
                </p>
            </aside>
            @endif

        <div class="hp-hero__content">
            <span class="hp-hero__badge">Welcome to Paradise</span>
            <h1 class="hp-hero__title">
                <span>Hinaguan Nature Park</span>
            </h1>
            <p class="hp-hero__subtitle">
                Escape into lush forests, crystal-clear streams, and breathtaking views.
                A sanctuary where nature and adventure meet.
            </p>
            <div class="hp-hero__actions">
                <a href="{{ route('reservation') }}" class="hp-btn hp-btn--hero">Book Now</a>
                <a href="{{ route('amenities') }}" class="hp-btn hp-btn--ghost">View Amenities</a>
            </div>
        </div>

        <div class="hp-hero__scroll" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
        </div>
    </section>

    {{-- About --}}
    <section class="hp-section hp-section--cream" id="about">
        <div class="hp-container">
            <div class="hp-section__header">
                <span class="hp-section__label">About Us</span>
                <h2 class="hp-section__title">A Haven of Natural Beauty</h2>
                <p class="hp-section__desc">
                    Hinaguan Nature Park is dedicated to preserving our region's rich ecosystem
                    while offering visitors a chance to reconnect with the great outdoors.
                </p>
            </div>

            <div class="hp-about-grid">
                <div class="hp-about__image">
                    <img
                        src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80"
                        alt="Sunlight filtering through forest trees at Hinaguan Nature Park"
                        loading="lazy"
                    >
                </div>

                <div class="hp-about__text">
                    <h3>Our Story</h3>
                    <p>
                        Nestled among rolling hills and ancient woodlands, Hinaguan Nature Park
                        protects over hundreds of hectares of pristine habitat. From winding hiking
                        trails to serene picnic spots, every corner invites exploration and wonder.
                    </p>
                    <p>
                        We work closely with local communities and conservation groups to safeguard
                        native flora and fauna, ensuring this natural treasure thrives for generations to come.
                    </p>

                    <div class="hp-stats">
                        <div class="hp-stat">
                            <span class="hp-stat__number">150+</span>
                            <span class="hp-stat__label">Hectares Protected</span>
                        </div>
                        <div class="hp-stat">
                            <span class="hp-stat__number">40+</span>
                            <span class="hp-stat__label">Flora &amp; Fauna Species</span>
                        </div>
                        <div class="hp-stat">
                            <span class="hp-stat__number">5</span>
                            <span class="hp-stat__label">Scenic Trail Routes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {{-- Features / Explore --}}
    <section class="hp-section hp-section--dark" id="features">
        <div class="hp-container">
            <div class="hp-section__header">
                <span class="hp-section__label">Explore</span>
                <h2 class="hp-section__title">What Awaits You</h2>
                <p class="hp-section__desc">
                    Whether you seek adventure or tranquility, Hinaguan Nature Park has something for everyone.
                </p>
            </div>

            <div class="hp-features">
                <div class="hp-feature">
                    <div class="hp-feature__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                        </svg>
                    </div>
                    <h3 class="hp-feature__title">Hiking Trails</h3>
                    <p class="hp-feature__desc">
                        Trek through scenic paths ranging from easy walks to challenging summit routes,
                        each offering stunning panoramic views.
                    </p>
                </div>

                <div class="hp-feature">
                    <div class="hp-feature__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                                    </svg>
                    </div>
                    <h3 class="hp-feature__title">Wildlife Watching</h3>
                    <p class="hp-feature__desc">
                        Spot native birds, butterflies, and other wildlife in their natural habitat.
                        Bring your binoculars and camera for unforgettable encounters.
                    </p>
                </div>

                <div class="hp-feature">
                    <div class="hp-feature__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                    </div>
                    <h3 class="hp-feature__title">Picnic &amp; Camping</h3>
                    <p class="hp-feature__desc">
                        Relax at designated picnic areas or spend a night under the stars at our
                        eco-friendly camping grounds surrounded by nature.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {{-- Book CTA --}}
    <section class="hp-cta">
        <div class="hp-container">
            <h2 class="hp-cta__title">Plan Your Adventure Today</h2>
            <p class="hp-cta__desc">
                Reserve your spot and explore everything Hinaguan Nature Park has to offer.
            </p>
            <div class="hp-cta__actions">
                <a href="{{ route('reservation') }}" class="hp-btn hp-btn--hero">Book Now</a>
                <a href="{{ route('amenities') }}" class="hp-btn hp-btn--ghost">Browse Amenities</a>
            </div>
        </div>
    </section>

    {{-- Contact --}}
    <section class="hp-section hp-section--white" id="contact">
        <div class="hp-container">
            <div class="hp-section__header">
                <span class="hp-section__label">Contact</span>
                <h2 class="hp-section__title">Get in Touch</h2>
                <p class="hp-section__desc">
                    Have questions or ready to plan your visit? We'd love to hear from you.
                </p>
            </div>

            <div class="hp-contact-grid">
                <div class="hp-contact__info">
                    <div class="hp-contact-item">
                        <div class="hp-contact-item__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="hp-contact-item__label">Location</p>
                            <p class="hp-contact-item__value">Hinaguan, Nature Park Road<br>Philippines</p>
                        </div>
                    </div>

                    <div class="hp-contact-item">
                        <div class="hp-contact-item__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                        </div>
                        <div>
                            <p class="hp-contact-item__label">Phone</p>
                            <p class="hp-contact-item__value">+63 (0) 900 000 0000</p>
                        </div>
                    </div>

                    <div class="hp-contact-item">
                        <div class="hp-contact-item__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                        </div>
                        <div>
                            <p class="hp-contact-item__label">Email</p>
                            <p class="hp-contact-item__value">info@hinaguannaturepark.com</p>
                        </div>
                    </div>

                    <div class="hp-contact-item">
                        <div class="hp-contact-item__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                        </div>
                        <div>
                            <p class="hp-contact-item__label">Park Hours</p>
                            <p class="hp-contact-item__value">Daily &middot; 6:00 AM – 6:00 PM</p>
                        </div>
                    </div>
                </div>

                <div class="hp-contact__map">
                    <p>Map coming soon</p>
                </div>
            </div>
        </div>
    </section>

    {{-- Footer --}}
    <footer class="hp-footer">
        <p>&copy; {{ date('Y') }} <strong>Hinaguan Nature Park</strong>. All rights reserved.</p>
    </footer>

    </body>
</html>

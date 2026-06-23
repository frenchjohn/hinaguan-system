<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Hinaguan Nature Park staff and admin login page.">
    <title>Login — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/css/loginpage.css', 'resources/js/loginpage.js'])
</head>
<body class="login-page">
    <main class="login-page__wrapper">
        <section class="login-page__split">
            <aside class="login-panel login-panel--brand">
                <div class="login-panel__content">
                    <span class="login-panel__eyebrow">Hinaguan Nature Park</span>
                    <h1 class="login-panel__title">Park staff portal</h1>
                    <p class="login-panel__text">
                        Secure access for park staff and administrators.
                        Manage reservations, view the dashboard, and keep operations running smoothly.
                    </p>
                </div>
                <div class="login-panel__visual" aria-hidden="true"></div>
            </aside>

            <aside class="login-panel login-panel--form">
                <section class="login-card">
                    <div class="login-card__intro">
                        <span class="login-card__label">Partner Portal</span>
                        <h2>Sign in to your account</h2>
                        <p>Only staff and admin can access this area.</p>
                    </div>

                    @if(session('error'))
                        <div class="login-card__alert">{{ session('error') }}</div>
                    @endif

                    <form method="POST" action="{{ route('login.submit') }}" class="login-form">
                        @csrf

                        <div class="login-form__group">
                            <label for="email">Email</label>
                            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email" />
                            @error('email')
                                <p class="login-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="login-form__group">
                            <label for="password">Password</label>
                            <div class="login-form__password">
                                <input id="password" type="password" name="password" required autocomplete="current-password" />
                                <button type="button" class="login-form__toggle" data-password-toggle>Show</button>
                            </div>
                            @error('password')
                                <p class="login-form__error">{{ $message }}</p>
                            @enderror
                        </div>

                        <button type="submit" class="login-form__submit">Log in</button>
                    </form>
                </section>
            </aside>
        </section>
    </main>
</body>
</html>

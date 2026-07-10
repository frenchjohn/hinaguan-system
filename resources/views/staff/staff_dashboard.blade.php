<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Staff Dashboard — Hinaguan Nature Park</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|playfair-display:600,700" rel="stylesheet">
    @vite([
        'resources/css/app.css',
        'resources/components/css_js/header.css',
        'resources/components/css_js/sidemenu.css',
        'resources/css/staff_css/staff_dashboard.css',
        'resources/components/css_js/header.js',
        'resources/components/css_js/sidemenu.js',
        'resources/js/staff_js/staff_dashboard.js',
    ])
</head>
<body class="antialiased">
    <div class="dash-layout">
        <x-staff_sidemenu active="dashboard" />

        <div class="dash-main">
            <x-header
                title="Staff Dashboard"
                subtitle="Daily tasks and guest activity at the park"
                userName="Staff User"
                userRole="Staff"
                :settingsUrl="route('staff.settings')"
            />

            <main class="dash-content">
                <section class="dash-welcome">
                    <h2 class="dash-welcome__title">Welcome back, Staff!</h2>
                    <p class="dash-welcome__text">
                        Track today's check-ins, pending reservations, and on-site guests. Prototype view — data is sample only.
                    </p>
                </section>

                <div class="dash-stats">
                    <article class="dash-stat-card">
                        <p class="dash-stat-card__label">Today's Check-ins</p>
                        <p class="dash-stat-card__value">{{ $todayCheckIns }}</p>
                        <p class="dash-stat-card__hint">Reservations marked as checked in today</p>
                    </article>
                    <article class="dash-stat-card">
                        <p class="dash-stat-card__label">Pending Reservations</p>
                        <p class="dash-stat-card__value">{{ $pendingReservationsCount }}</p>
                        <p class="dash-stat-card__hint">Online reservations awaiting action</p>
                    </article>
                    <article class="dash-stat-card">
                        <p class="dash-stat-card__label">Guests On-site</p>
                        <p class="dash-stat-card__value">{{ $guestsOnSiteCount }}</p>
                        <p class="dash-stat-card__hint">Guests still active and not checked out</p>
                    </article>
                </div>

                <div class="dash-grid-2">
                    <section class="dash-panel">
                        <div class="dash-panel__head">
                            <h3 class="dash-panel__title">Today's Tasks</h3>
                        </div>
                        <ul class="dash-task-list">
                            @foreach ([
                                ['title' => 'Prepare Cottage A for 2:00 PM check-in', 'meta' => 'Guest: Maria Santos'],
                                ['title' => 'Verify picnic area reservation list', 'meta' => 'Before noon'],
                                ['title' => 'Restock welcome desk supplies', 'meta' => 'Front office'],
                                ['title' => 'Assist camping ground orientation', 'meta' => '3:30 PM group'],
                            ] as $task)
                                <li class="dash-task">
                                    <input type="checkbox" class="dash-task__check" aria-label="Mark task complete">
                                    <div class="dash-task__body">
                                        <p class="dash-task__title">{{ $task['title'] }}</p>
                                        <p class="dash-task__meta">{{ $task['meta'] }}</p>
                                    </div>
                                </li>
                            @endforeach
                        </ul>
                    </section>

                    <section class="dash-panel">
                        <div class="dash-panel__head">
                            <h3 class="dash-panel__title">Recent Activity</h3>
                        </div>
                        <ul class="dash-activity-list">
                            @forelse ($activityItems as $activity)
                                <li class="dash-activity">
                                    <span class="dash-activity__dot" aria-hidden="true"></span>
                                    <div>
                                        <p class="dash-activity__text">{{ $activity['text'] }}</p>
                                        <p class="dash-activity__time">{{ $activity['time'] }}</p>
                                    </div>
                                </li>
                            @empty
                                <li class="dash-activity">
                                    <span class="dash-activity__dot" aria-hidden="true"></span>
                                    <div>
                                        <p class="dash-activity__text">No recent reservation activity yet.</p>
                                        <p class="dash-activity__time">Check back soon</p>
                                    </div>
                                </li>
                            @endforelse
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    </div>
</body>
</html>

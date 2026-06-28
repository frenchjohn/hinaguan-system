<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;

try {
    $otp = random_int(100000, 999999);
    Mail::mailer('smtp')->send('emails.staff_settings_otp', [
        'otp' => $otp,
        'name' => 'Test User',
    ], function ($message) {
        $message->from('parkhinaguan@gmail.com', 'Hinaguan Nature Park')
            ->to('frenchjohnfamador.s@gmail.com')
            ->subject('SMTP test send');
    });
    echo "SMTP send attempt complete\n";
} catch (Throwable $e) {
    echo 'ERROR: ' . get_class($e) . ': ' . $e->getMessage() . "\n";
    file_put_contents(__DIR__ . '/../storage/logs/send_test_error.log', (string) $e);
}

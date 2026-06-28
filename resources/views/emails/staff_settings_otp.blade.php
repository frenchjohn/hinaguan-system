<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hinaguan Nature Park Verification Code</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f4f7fb;
            color: #111827;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 24px;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
        }
        .brand {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        .brand__mark {
            width: 40px;
            height: 40px;
            background: #1d4ed8;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 700;
            font-size: 1rem;
        }
        .brand__name {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0f172a;
        }
        h1 {
            margin: 0 0 1rem;
            font-size: 1.6rem;
            color: #0f172a;
        }
        p {
            margin: 0 0 1rem;
            line-height: 1.75;
            color: #475569;
        }
        .otp-code {
            display: inline-block;
            padding: 1rem 1.25rem;
            background: #eef2ff;
            border: 1px dashed #c7d2fe;
            border-radius: 16px;
            font-size: 1.75rem;
            letter-spacing: 0.35rem;
            font-weight: 700;
            color: #1d4ed8;
            margin: 1rem 0 1rem;
        }
        .footer {
            margin-top: 2rem;
            font-size: 0.95rem;
            color: #64748b;
        }
        .footer a {
            color: #1d4ed8;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="brand">
                <span class="brand__mark">H</span>
                <span class="brand__name">Hinaguan Nature Park</span>
            </div>
            <h1>Your settings are about to change</h1>
            <p>Hi {{ $name }},</p>
            <p>We received a request to update your staff account settings. Before we apply any changes, please confirm your identity by entering the verification code below.</p>
            <div class="otp-code">{{ $otp }}</div>
            <p>If you did not request this change, you can safely ignore this email. Your account will remain unchanged.</p>
            <div class="footer">
                <p>Thank you,<br>Hinaguan Nature Park Team</p>
                <p><a href="{{ url('/') }}">hinaguan nature park</a></p>
            </div>
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Change Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        .logo {
            font-size: 0.875rem;
            opacity: 0.8;
            margin-top: 0.5rem;
        }
        .content {
            padding: 2rem;
        }
        .greeting {
            font-size: 1rem;
            margin-bottom: 1.5rem;
        }
        .otp-section {
            background-color: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            margin: 2rem 0;
        }
        .otp-label {
            font-size: 0.875rem;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .otp-code {
            font-size: 2.5rem;
            font-weight: 700;
            color: #15803d;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 1rem 0;
        }
        .otp-expires {
            font-size: 0.875rem;
            color: #166534;
            margin-top: 1rem;
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 1rem;
            margin: 2rem 0;
            border-radius: 4px;
            color: #92400e;
            font-size: 0.875rem;
        }
        .footer {
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.875rem;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hinaguan Nature Park</h1>
            <div class="logo">Admin Portal</div>
        </div>

        <div class="content">
            <div class="greeting">
                <strong>Hi {{ $name }},</strong>
                <p>We received a request to change your admin account password. To proceed, please use the verification code below:</p>
            </div>

            <div class="otp-section">
                <div class="otp-label">Verification Code</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-expires">⏱️ This code expires in 15 minutes</div>
            </div>

            <p>Enter this code in the password change form to verify your identity and complete the password change.</p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request a password change, please ignore this email or contact support immediately. Never share this code with anyone.
            </div>

            <p style="margin-top: 2rem; color: #666;">
                Need help? <a href="mailto:parkhinaguan@gmail.com" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Hinaguan Nature Park. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
    </div>
</body>
</html>

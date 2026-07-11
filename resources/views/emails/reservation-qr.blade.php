<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hinaguan Nature Park Reservation</title>
</head>
<body style="margin:0; padding:24px; background-color:#f6f1e8; font-family:Arial, Helvetica, sans-serif; color:#2d3a2c;">
    <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(15,23,42,0.10);">
        <div style="background:linear-gradient(135deg,#1f4d2e 0%,#3b6f3f 100%); padding:28px 32px; color:#ffffff;">
            <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; opacity:0.85; margin-bottom:8px;">Hinaguan Nature Park</div>
            <h1 style="margin:0; font-size:28px; line-height:1.2;">Your reservation is confirmed</h1>
            <p style="margin:10px 0 0; font-size:15px; line-height:1.6; opacity:0.95;">Please keep this QR code ready for a smooth check-in at the park.</p>
        </div>

        <div style="padding:28px 32px 24px;">
            <p style="margin:0 0 12px; font-size:15px; line-height:1.7;">Thank you for booking with us. This card contains your reservation details and a scannable QR code for arrival.</p>
            <div style="background:#f8f5eb; border:1px solid #e7dcc7; border-radius:16px; padding:16px 18px; margin:18px 0;">
                <p style="margin:0 0 6px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#7a6946;">Reservation details</p>
                <p style="margin:4px 0; font-size:15px;"><strong>Reservation ID:</strong> {{ $reservation->id }}</p>
                <p style="margin:4px 0; font-size:15px;"><strong>Customer ID:</strong> {{ optional($reservation->reservationGuests->first())->customer_id ?? 'N/A' }}</p>
                <p style="margin:4px 0; font-size:15px;"><strong>Reference:</strong> {{ $qrPayload }}</p>
            </div>

            <div style="text-align:center; padding:8px 0 16px;">
                <p style="margin:0 0 12px; font-size:15px; font-weight:600; color:#2d3a2c;">Scan this QR code at arrival</p>
                <div style="display:inline-block; width:100%; max-width:320px; padding:10px; background:#ffffff; border:1px solid #e7dcc7; border-radius:18px;">
                    <img src="{{ $qrImageUrl }}" alt="Reservation QR code" style="display:block; width:100%; max-width:300px; height:auto; margin:0 auto; border-radius:16px; background:#ffffff;" />
                </div>
            </div>

            <p style="margin:18px 0 0; font-size:14px; line-height:1.7; color:#5f6d5d;">On your reserved date, staff can scan this QR code to confirm your arrival and check your reservation in.</p>
        </div>
    </div>
</body>
</html>

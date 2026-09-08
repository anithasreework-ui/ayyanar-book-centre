import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv(
    "FROM_EMAIL",
    "ayyanarbookcentredgl1@gmail.com"
)
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://ayyanarbookcentre.vercel.app"
)


def _send(to_email: str, subject: str, html: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        print("❌ SMTP credentials not configured!")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Ayyanar Book Centre <{FROM_EMAIL}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_USER, SMTP_PASSWORD)
            s.sendmail(FROM_EMAIL, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        return False


def send_reset_email(
    to_email: str, name: str, otp: str
) -> bool:
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;
             font-family:Arial,sans-serif">
<div style="max-width:500px;margin:32px auto;
            background:#fff;border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <div style="background:#1a4a2e;padding:28px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0;font-size:22px">
      Ayyanar Book Centre
    </h2>
    <p style="color:rgba(255,255,255,0.6);
              font-size:12px;margin:4px 0 0">
      Dindigul, Tamil Nadu — Est. 1985
    </p>
  </div>

  <div style="padding:32px">
    <h3 style="color:#1a1a1a;margin:0 0 8px;font-size:18px">
      Password Reset OTP
    </h3>
    <p style="color:#6b7280;font-size:14px;
              line-height:1.6;margin:0 0 24px">
      Hi <strong>{name}</strong>, use the OTP below
      to reset your password.
    </p>

    <div style="background:#f0f7f4;
                border:2px solid #1a4a2e;
                border-radius:12px;padding:24px;
                text-align:center;margin:0 0 24px">
      <p style="color:#6b7280;font-size:11px;
                letter-spacing:2px;margin:0 0 8px;
                text-transform:uppercase">
        One-Time Password
      </p>
      <p style="color:#1a4a2e;font-size:44px;
                font-weight:700;letter-spacing:12px;
                margin:0;font-family:monospace">
        {otp}
      </p>
      <p style="color:#9ca3af;font-size:12px;
                margin:10px 0 0">
        ⏰ Valid for <strong>10 minutes</strong> only
      </p>
    </div>

    <div style="background:#fef3c7;
                border-left:4px solid #f59e0b;
                border-radius:4px;
                padding:12px 16px;margin:0 0 20px">
      <p style="color:#92400e;font-size:13px;margin:0">
        🔒 Never share this OTP with anyone.
        Ayyanar Book Centre will never ask for your OTP.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0">
      If you did not request this, ignore this email.
      Your account is safe.
    </p>
  </div>

  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre · Dindigul 624001<br>
      📞 +91 9894235330 |
      ayyanarbookcentredgl1@gmail.com
    </p>
  </div>

</div>
</body>
</html>
    """
    return _send(
        to_email,
        "Your OTP — Ayyanar Book Centre",
        html
    )


def send_reset_link(
    to_email: str, name: str, reset_token: str
) -> bool:
    reset_url = (
        f"{FRONTEND_URL}/reset-password?token={reset_token}"
    )
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;
             font-family:Arial,sans-serif">
<div style="max-width:500px;margin:32px auto;
            background:#fff;border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <div style="background:#1a4a2e;padding:28px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0;font-size:22px">
      Ayyanar Book Centre
    </h2>
  </div>

  <div style="padding:32px">
    <h3 style="color:#1a1a1a;margin:0 0 8px">
      Reset Your Password
    </h3>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
      Hi {name}, click below to reset your password.
      Link expires in <strong>1 hour</strong>.
    </p>

    <div style="text-align:center;margin:0 0 24px">
      <a href="{reset_url}"
         style="background:#1a4a2e;color:#fff;
                text-decoration:none;
                padding:14px 40px;border-radius:8px;
                font-size:15px;font-weight:700;
                display:inline-block">
        Reset Password →
      </a>
    </div>

    <p style="color:#9ca3af;font-size:12px;margin:0">
      If you did not request this, ignore this email.
    </p>
  </div>

  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre · Dindigul 624001
    </p>
  </div>

</div>
</body>
</html>
    """
    return _send(
        to_email,
        "Reset Your Password — Ayyanar Book Centre",
        html
    )


def send_order_email(
    to_email: str, name: str, order_id: int,
    total: float, tracking_id: str = None,
    otp_code: str = None
) -> bool:
    special = ""
    if otp_code:
        special = f"""
    <div style="background:#f5f3ff;
                border:2px solid #7c3aed;
                border-radius:10px;padding:20px;
                text-align:center;margin:16px 0">
      <p style="color:#7c3aed;font-size:11px;
                letter-spacing:2px;margin:0 0 8px;
                text-transform:uppercase">
        Store Pickup OTP
      </p>
      <p style="color:#5b21b6;font-size:40px;
                font-weight:700;letter-spacing:10px;
                margin:0;font-family:monospace">
        {otp_code}
      </p>
    </div>
        """
    elif tracking_id:
        special = f"""
    <div style="background:#f0fdf4;
                border:2px solid #1a4a2e;
                border-radius:10px;padding:20px;
                text-align:center;margin:16px 0">
      <p style="color:#1a4a2e;font-size:11px;
                letter-spacing:2px;margin:0 0 8px;
                text-transform:uppercase">
        Tracking ID
      </p>
      <p style="color:#1a4a2e;font-size:36px;
                font-weight:700;letter-spacing:8px;
                margin:0;font-family:monospace">
        {tracking_id}
      </p>
    </div>
        """

    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;
             font-family:Arial,sans-serif">
<div style="max-width:500px;margin:32px auto;
            background:#fff;border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <div style="background:#1a4a2e;padding:28px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0;font-size:22px">
      Order Confirmed! 🎉
    </h2>
  </div>

  <div style="padding:28px">
    <p style="color:#374151;font-size:15px;margin:0 0 8px">
      Hi <strong>{name}</strong>,
    </p>
    <p style="color:#6b7280;font-size:14px;margin:0 0 16px">
      Order <strong>#{order_id}</strong> placed!
      Total: <strong style="color:#1a4a2e">
        Rs.{total:.2f}
      </strong>
    </p>
    {special}
    <p style="color:#9ca3af;font-size:13px;margin:16px 0 0">
      📞 +91 9894235330 | Mon–Sat: 9AM–9PM
    </p>
  </div>

  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre · Dindigul 624001
    </p>
  </div>

</div>
</body>
</html>
    """
    return _send(
        to_email,
        f"Order #{order_id} Confirmed — Ayyanar Book Centre",
        html
    )


def send_welcome_email(
    to_email: str, name: str
) -> bool:
    html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;
             font-family:Arial,sans-serif">
<div style="max-width:500px;margin:32px auto;
            background:#fff;border-radius:12px;
            overflow:hidden;
            box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <div style="background:#1a4a2e;padding:28px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0;font-size:22px">
      Welcome to Ayyanar Book Centre!
    </h2>
  </div>

  <div style="padding:32px">
    <p style="color:#374151;font-size:15px;margin:0 0 12px">
      Hi <strong>{name}</strong>! 👋
    </p>
    <p style="color:#6b7280;font-size:14px;
              line-height:1.6;margin:0 0 20px">
      Welcome to Dindigul's most trusted bookshop!
    </p>

    <div style="background:#f0f7f4;border-radius:10px;
                padding:16px;margin:0 0 20px">
      <ul style="color:#374151;font-size:13px;
                 margin:0;padding-left:16px;line-height:2">
        <li>Free delivery under 1kg across India</li>
        <li>Store pickup at Dindigul</li>
        <li>Worldwide shipping available</li>
        <li>Wholesale for schools and colleges</li>
      </ul>
    </div>

    <div style="text-align:center">
      <a href="{FRONTEND_URL}/products"
         style="background:#1a4a2e;color:#fff;
                text-decoration:none;padding:12px 32px;
                border-radius:8px;font-size:14px;
                font-weight:700;display:inline-block">
        Start Shopping →
      </a>
    </div>
  </div>

  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre · Dindigul 624001
    </p>
  </div>

</div>
</body>
</html>
    """
    return _send(
        to_email,
        "Welcome to Ayyanar Book Centre! 📚",
        html
    )
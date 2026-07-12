import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://ayyanarbookcentre.vercel.app"
)


def _send_email(to_email: str, subject: str, html: str) -> bool:
    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("Email not configured — skipping")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Ayyanar Book Centre <{EMAIL_USER}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(EMAIL_USER, EMAIL_PASSWORD)
            s.sendmail(EMAIL_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


# Function 1 — OTP Email (Amazon Style)
def send_reset_email(
    to_email: str, name: str, otp: str
) -> bool:
    html = f"""
<div style="font-family:Arial,sans-serif;max-width:500px;
            margin:0 auto;background:#fff">
  <div style="background:#1a4a2e;padding:24px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0">
      Ayyanar Book Centre
    </h2>
  </div>
  <div style="padding:32px">
    <p style="color:#374151">Hi {name},</p>
    <p style="color:#6b7280;font-size:14px">
      Your password reset OTP:
    </p>
    <div style="background:#f0f7f4;border:2px solid #1a4a2e;
                border-radius:10px;padding:24px;
                text-align:center;margin:20px 0">
      <p style="color:#1a4a2e;font-size:40px;
                font-weight:700;letter-spacing:10px;
                margin:0;font-family:monospace">
        {otp}
      </p>
      <p style="color:#6b7280;font-size:12px;margin:8px 0 0">
        Valid for 10 minutes only
      </p>
    </div>
    <p style="color:#9ca3af;font-size:12px">
      Do not share this OTP with anyone.
      Ayyanar Book Centre will never ask for your OTP.
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre, Dindigul — 624001
    </p>
  </div>
</div>
    """
    return _send_email(
        to_email,
        "Your OTP — Ayyanar Book Centre",
        html
    )


# Function 2 — Reset Link Email
def send_reset_link(
    to_email: str, name: str, reset_token: str
) -> bool:
    reset_url = (
        f"{FRONTEND_URL}/reset-password?token={reset_token}"
    )
    html = f"""
<div style="font-family:Arial,sans-serif;max-width:500px;
            margin:0 auto;background:#fff">
  <div style="background:#1a4a2e;padding:24px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0">
      Ayyanar Book Centre
    </h2>
  </div>
  <div style="padding:32px">
    <p style="color:#374151">Hi {name},</p>
    <p style="color:#6b7280;font-size:14px">
      Click the button below to reset your password.
      This link expires in 1 hour.
    </p>
    <div style="text-align:center;margin:28px 0">
      <a href="{reset_url}"
         style="background:#1a4a2e;color:#fff;
                text-decoration:none;
                padding:14px 36px;border-radius:8px;
                font-size:15px;font-weight:700">
        Reset Password
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px">
      If you did not request this, ignore this email.
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre, Dindigul — 624001
    </p>
  </div>
</div>
    """
    return _send_email(
        to_email,
        "Reset Your Password — Ayyanar Book Centre",
        html
    )


# Function 3 — Order Confirmation Email
def send_order_email(
    to_email: str, name: str, order_id: int,
    total: float, tracking_id: str = None,
    otp_code: str = None
) -> bool:
    special = ""
    if otp_code:
        special = f"""
    <div style="background:#f5f3ff;border:2px solid #7c3aed;
                border-radius:10px;padding:20px;
                text-align:center;margin:16px 0">
      <p style="color:#7c3aed;font-size:11px;
                letter-spacing:2px;margin:0 0 8px">
        STORE PICKUP OTP
      </p>
      <p style="color:#5b21b6;font-size:36px;
                font-weight:700;letter-spacing:8px;
                margin:0;font-family:monospace">
        {otp_code}
      </p>
    </div>
        """
    elif tracking_id:
        special = f"""
    <div style="background:#f0fdf4;border:2px solid #1a4a2e;
                border-radius:10px;padding:20px;
                text-align:center;margin:16px 0">
      <p style="color:#1a4a2e;font-size:11px;
                letter-spacing:2px;margin:0 0 8px">
        TRACKING ID
      </p>
      <p style="color:#1a4a2e;font-size:30px;
                font-weight:700;letter-spacing:6px;
                margin:0;font-family:monospace">
        {tracking_id}
      </p>
    </div>
        """

    html = f"""
<div style="font-family:Arial,sans-serif;max-width:500px;
            margin:0 auto;background:#fff">
  <div style="background:#1a4a2e;padding:24px;
              text-align:center">
    <h2 style="color:#d4a853;margin:0">
      Order Confirmed!
    </h2>
    <p style="color:rgba(255,255,255,0.7);
              margin:4px 0 0;font-size:13px">
      Ayyanar Book Centre
    </p>
  </div>
  <div style="padding:28px">
    <p style="color:#374151">Hi {name},</p>
    <p style="color:#6b7280;font-size:14px">
      Order <strong>#{order_id}</strong> placed!
      Total: <strong style="color:#1a4a2e">
        Rs.{total:.2f}
      </strong>
    </p>
    {special}
    <p style="color:#9ca3af;font-size:13px">
      📞 +91 9894235330 | Mon–Sat: 9AM–9PM
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;
              text-align:center;
              border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:11px;margin:0">
      © 2025 Ayyanar Book Centre, Dindigul — 624001
    </p>
  </div>
</div>
    """
    return _send_email(
        to_email,
        f"Order #{order_id} Confirmed — Ayyanar Book Centre",
        html
    )
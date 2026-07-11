import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv(
    "EMAIL_USER", "ayyanarbookcentredgl1@gmail.com"
)
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
FRONTEND_URL = os.getenv(
    "FRONTEND_URL", "https://ayyanarbookcentre.vercel.app"
)


def send_reset_link(
    to_email: str,
    name: str,
    reset_token: str
) -> bool:
    reset_url = (
        f"{FRONTEND_URL}/reset-password?token={reset_token}"
    )

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = (
            "Reset Your Password — Ayyanar Book Centre"
        )
        msg["From"] = (
            f"Ayyanar Book Centre <{EMAIL_USER}>"
        )
        msg["To"] = to_email

        html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f4;
             font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:40px auto;
              background:#ffffff;border-radius:12px;
              overflow:hidden;
              box-shadow:0 4px 12px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:#1a4a2e;padding:32px 24px;
                text-align:center">
      <h1 style="color:#d4a853;margin:0;font-size:24px;
                 font-weight:700">
        Ayyanar Book Centre
      </h1>
      <p style="color:rgba(255,255,255,0.65);
                font-size:13px;margin:6px 0 0">
        Dindigul, Tamil Nadu — Est. 1985
      </p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px">
      <h2 style="color:#1a1a1a;font-size:20px;
                 margin:0 0 12px">
        Password Reset Request
      </h2>
      <p style="color:#4b5563;font-size:15px;
                line-height:1.6;margin:0 0 8px">
        Hi <strong>{name}</strong>,
      </p>
      <p style="color:#6b7280;font-size:14px;
                line-height:1.6;margin:0 0 28px">
        We received a request to reset the password for
        your Ayyanar Book Centre account. Click the button
        below to create a new password.
      </p>

      <!-- Button -->
      <div style="text-align:center;margin:0 0 28px">
        <a href="{reset_url}"
           style="display:inline-block;
                  background:#1a4a2e;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 36px;
                  border-radius:8px;
                  font-size:15px;
                  font-weight:700;
                  letter-spacing:0.5px">
          Reset My Password
        </a>
      </div>

      <!-- Link fallback -->
      <p style="color:#9ca3af;font-size:12px;
                margin:0 0 8px;text-align:center">
        Or copy and paste this link in your browser:
      </p>
      <p style="background:#f3f4f6;border-radius:6px;
                padding:10px 14px;font-size:11px;
                color:#374151;word-break:break-all;
                margin:0 0 28px;text-align:center">
        {reset_url}
      </p>

      <!-- Warning box -->
      <div style="background:#fef3c7;
                  border-left:4px solid #f59e0b;
                  border-radius:4px;
                  padding:14px 16px;margin:0 0 24px">
        <p style="color:#92400e;font-size:13px;
                  margin:0;line-height:1.5">
          ⏰ <strong>This link expires in 1 hour.</strong>
          <br>If you did not request a password reset,
          please ignore this email — your account is safe.
        </p>
      </div>

      <!-- Support -->
      <p style="color:#9ca3af;font-size:13px;
                line-height:1.6;margin:0">
        Need help?
        <a href="mailto:ayyanarbookcentredgl1@gmail.com"
           style="color:#1a4a2e">
          ayyanarbookcentredgl1@gmail.com
        </a>
        &nbsp;|&nbsp;
        <a href="tel:+919894235330"
           style="color:#1a4a2e">
          +91 9894235330
        </a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;
                border-top:1px solid #e5e7eb;
                padding:16px 32px;text-align:center">
      <p style="color:#9ca3af;font-size:11px;margin:0">
        © 2025 Ayyanar Book Centre · Dindigul 624001
        · Tamil Nadu, India
      </p>
      <p style="color:#d1d5db;font-size:11px;margin:4px 0 0">
        You received this because you requested a
        password reset.
      </p>
    </div>
  </div>
</body>
</html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(EMAIL_USER, EMAIL_PASSWORD)
            s.sendmail(EMAIL_USER, to_email, msg.as_string())

        print(f"✅ Reset link sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False
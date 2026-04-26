import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")


def send_email(to_email: str, subject: str, body_html: str):
    """Send email via Gmail SMTP"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Ayyanar Book Centre <{EMAIL_USER}>"
        msg["To"] = to_email

        part = MIMEText(body_html, "html")
        msg.attach(part)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())

        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False


def send_password_reset_email(
    to_email: str,
    name: str,
    temp_password: str
):
    subject = "Ayyanar Book Centre — Password Reset"
    body = f"""
    <div style="font-family: Georgia, serif; max-width: 600px;
                margin: 0 auto; background: #faf9f7;
                padding: 40px 20px;">

      <div style="background: #1a4a2e; padding: 24px;
                  border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #d4a853; margin: 0;
                   font-size: 22px;">
          Ayyanar Book Centre
        </h1>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0;
                  font-size: 13px;">
          Dindigul, Tamil Nadu
        </p>
      </div>

      <div style="background: #ffffff; padding: 32px;
                  border-radius: 0 0 12px 12px;
                  border: 1px solid #e8e4df;">
        <p style="color: #374151; font-size: 15px;">
          Hi {name},
        </p>
        <p style="color: #374151; font-size: 14px;">
          You requested a password reset for your
          Ayyanar Book Centre account.
        </p>

        <div style="background: #f0f7f4; border: 2px solid #1a4a2e;
                    border-radius: 10px; padding: 20px;
                    text-align: center; margin: 24px 0;">
          <p style="color: #6b7280; font-size: 12px;
                    margin: 0 0 8px; letter-spacing: 1px;">
            YOUR TEMPORARY PASSWORD
          </p>
          <p style="color: #1a4a2e; font-size: 28px;
                    font-weight: 700; letter-spacing: 4px;
                    margin: 0; font-family: monospace;">
            {temp_password}
          </p>
        </div>

        <p style="color: #374151; font-size: 13px;">
          Steps to reset your password:
        </p>
        <ol style="color: #374151; font-size: 13px;
                   line-height: 1.8;">
          <li>Login with this temporary password</li>
          <li>Go to <strong>My Profile → Change Password</strong></li>
          <li>Enter the temporary password as Current Password</li>
          <li>Set your new password</li>
        </ol>

        <div style="background: #fef3c7; border-radius: 8px;
                    padding: 12px; margin-top: 20px;">
          <p style="color: #92400e; font-size: 12px; margin: 0;">
            ⚠️ This temporary password expires in 24 hours.
            Do not share it with anyone.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e8e4df;
                   margin: 24px 0;">

        <p style="color: #9ca3af; font-size: 11px; margin: 0;
                  text-align: center;">
          Ayyanar Book Centre · Dindigul, Tamil Nadu<br>
          📞 +91 9894235330 ·
          ayyanarbookcentredgl1@gmail.com
        </p>
      </div>
    </div>
    """
    return send_email(to_email, subject, body)


def send_order_confirmation_email(
    to_email: str,
    name: str,
    order_id: int,
    total: float,
    tracking_id: str = None,
    otp_code: str = None
):
    subject = f"Order Confirmed — #{order_id} | Ayyanar Book Centre"
    body = f"""
    <div style="font-family: Georgia, serif; max-width: 600px;
                margin: 0 auto; background: #faf9f7;
                padding: 40px 20px;">

      <div style="background: #1a4a2e; padding: 24px;
                  border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #d4a853; margin: 0; font-size: 22px;">
          Order Confirmed!
        </h1>
        <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0;
                  font-size: 13px;">
          Ayyanar Book Centre — Dindigul
        </p>
      </div>

      <div style="background: #ffffff; padding: 32px;
                  border-radius: 0 0 12px 12px;
                  border: 1px solid #e8e4df;">
        <p style="color: #374151; font-size: 15px;">
          Hi {name},
        </p>
        <p style="color: #374151; font-size: 14px;">
          Your order <strong>#{order_id}</strong> has been
          placed successfully!
        </p>

        <div style="background: #f0f7f4; border-radius: 10px;
                    padding: 16px; margin: 20px 0;">
          <p style="color: #1a4a2e; font-weight: 700;
                    margin: 0 0 4px;">
            Total Amount: Rs.{total:.2f}
          </p>
        </div>

        {"<div style='background: #f5f3ff; border: 2px solid #7c3aed; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;'><p style='color: #7c3aed; font-size: 12px; margin: 0 0 8px; letter-spacing: 1px;'>STORE PICKUP OTP</p><p style='color: #5b21b6; font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0; font-family: monospace;'>" + otp_code + "</p><p style='color: #6b7280; font-size: 12px; margin: 8px 0 0;'>Show this at Ayyanar Book Centre counter</p></div>" if otp_code else ""}

        {"<div style='background: #f0fdf4; border: 2px solid #1a4a2e; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;'><p style='color: #1a4a2e; font-size: 12px; margin: 0 0 8px; letter-spacing: 1px;'>TRACKING ID</p><p style='color: #1a4a2e; font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 0; font-family: monospace;'>" + tracking_id + "</p></div>" if tracking_id else ""}

        <p style="color: #6b7280; font-size: 12px;
                  text-align: center; margin-top: 24px;">
          📞 +91 9894235330 | Mon–Sat: 9AM–9PM
        </p>
      </div>
    </div>
    """
    return send_email(to_email, subject, body)
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("email")


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = "Reset your Gaffer's Picks password"
    message["From"] = settings.gmail_address
    message["To"] = to_email

    text = f"Reset your password here (expires in 1 hour):\n\n{reset_link}"
    html = f"""
    <div style="font-family: sans-serif; color: #1e293b;">
      <h2>Reset your Gaffer's Picks password</h2>
      <p>Click the button below to set a new password. This link expires in 1 hour.</p>
      <p>
        <a href="{reset_link}"
           style="background:#9333ea;color:white;padding:10px 20px;border-radius:6px;
                  text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="color:#64748b;font-size:13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(settings.gmail_address, settings.gmail_app_password)
        server.sendmail(settings.gmail_address, to_email, message.as_string())
    logger.info("Password reset email sent to %s", to_email)

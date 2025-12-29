import smtplib
import os
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load .env once
load_dotenv()

# ==============================
# CONFIG
# ==============================
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")
FROM_NAME = "DigiHire"

if not all([SMTP_USER, SMTP_PASS, FROM_EMAIL]):
    raise RuntimeError("SMTP configuration missing in environment variables")

# ==============================
# CORE MAIL FUNCTION
# ==============================
def send_email(
    to_emails: List[str],
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
) -> None:
    """
    Utility function. NOT a FastAPI route.
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = ", ".join(to_emails)
    msg["Subject"] = subject

    if text_body:
        msg.attach(MIMEText(text_body, "plain", "utf-8"))

    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to_emails, msg.as_string())
    except Exception as e:
        raise RuntimeError(f"Email sending failed: {str(e)}")


# ==============================
# INVITE TEMPLATE
# ==============================
def send_test_invite_email(
    to_emails: List[str],
    test_name: str,
    duration_minutes: int,
    test_link: str,
) -> None:

    subject = f"Invitation to Online Test – {test_name}"

    text_body = f"""
Hi,

Take a quick test to expedite your candidature.

We are delighted to invite you to take an online assessment at Digihire.

Test name: {test_name}
Duration: {duration_minutes} minutes

Take Test:
{test_link}
"""

    html_body = f"""
<html>
  <body style="font-family: Arial, sans-serif;">
    <p>Hi,</p>

    <p><b>Take a quick test</b> to expedite your candidature.</p>

    <p>
      We are delighted to invite you to take an online assessment
      which will help us understand your skills at <b>Digihire</b>.
    </p>

    <p>
      <b>Test name:</b> {test_name}<br/>
      <b>Duration:</b> {duration_minutes} minutes
    </p>

    <a href="{test_link}"
       style="padding:10px 16px;background:#2563eb;color:#fff;
              text-decoration:none;border-radius:6px;">
      Take Test
    </a>
  </body>
</html>
"""

    send_email(
        to_emails=to_emails,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )

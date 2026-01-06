# app/services/report_pdf.py
import os
import pdfkit
from app.services.report_template import render_report_html

REPORT_DIR = "app/reports"

WKHTMLTOPDF_PATH = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"

def generate_report_pdf(evaluation, student, test, questions):
    if not os.path.exists(REPORT_DIR):
        os.makedirs(REPORT_DIR)

    html_content = render_report_html(
        evaluation=evaluation,
        student=student,
        test=test,
        questions=questions
    )

    file_path = f"{REPORT_DIR}/{evaluation.id}.pdf"

    config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

    pdfkit.from_string(
        html_content,
        file_path,
        configuration=config,
        options={
            "enable-local-file-access": None,
            "page-size": "A4",
            "encoding": "UTF-8"
        }
    )

    return file_path

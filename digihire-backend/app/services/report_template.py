# app/services/report_template.py
def render_report_html(evaluation, student, test, questions):
    """
    NOTE:
    - evaluation.s_code may NOT exist for older records
    - So we derive S-code safely from percentage
    """

    percentage = evaluation.percentage or 0

    # ===== S-CODE DERIVATION (IMAGE-BASED LOGIC) =====
    if percentage <= 30:
        level = "Beginner"
        s_code = "S0"
    elif percentage <= 55:
        level = "Intermediate"
        s_code = "S1"
    elif percentage <= 75:
        level = "Proficient"
        s_code = "S2"
    elif percentage <= 90:
        level = "Advanced"
        s_code = "S3"
    else:
        level = "Expert"
        s_code = "S4"

    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {{
      font-family: Arial, sans-serif;
      font-size: 12px;
      margin: 30px;
      color: #333;
    }}

    h1 {{
      color: #1f4ed8;
      font-size: 26px;
    }}

    h2 {{
      color: #444;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
      margin-top: 30px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }}

    th, td {{
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }}

    th {{
      background-color: #f3f4f6;
    }}

    /* ===== TOP SUMMARY ===== */
    .summary {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin: 25px 0;
    }}

    .card {{
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      background: linear-gradient(145deg, #f8fafc, #eef2ff);
      border: 1px solid #e5e7eb;
    }}

    .label {{
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    .value {{
      font-size: 22px;
      font-weight: bold;
      margin-top: 6px;
      color: #111827;
    }}

    .badge {{
      padding: 6px 14px;
      background-color: #1f4ed8;
      color: #fff;
      border-radius: 999px;
      display: inline-block;
      font-weight: bold;
      font-size: 16px;
      margin-top: 8px;
    }}

    .footer {{
      margin-top: 45px;
      font-size: 10px;
      color: #777;
      text-align: center;
    }}
  </style>
</head>

<body>

  <h1>Assessment Report</h1>

  <p>
    <b>Candidate:</b> {student.full_name}<br/>
    <b>Email:</b> {student.email}<br/>
    <b>Test:</b> {test.title}<br/>
    <b>Proctoring Mode:</b> {test.proctoring_mode}<br/>
    <b>Appeared On:</b> {evaluation.test_log.get("appeared_on")}
  </p>

  <!-- ===== SUMMARY CARDS ===== -->
  <div class="summary">

    <div class="card">
      <div class="label">Total Score</div>
      <div class="value">{evaluation.total_score}/{evaluation.max_score}</div>
    </div>

    <div class="card">
      <div class="label">Percentage</div>
      <div class="value">{percentage}%</div>
    </div>

    <div class="card">
      <div class="label">Skill Category</div>
      <div class="value">{level}</div>
    </div>

    <div class="card">
      <div class="label">S-Code</div>
      <div class="badge">{s_code}</div>
    </div>

    <div class="card">
      <div class="label">Time Taken</div>
      <div class="value">{evaluation.time_taken_sec}s</div>
    </div>

  </div>

  <h2>Section Analysis</h2>
  <table>
    <tr>
      <th>Section</th>
      
      <th>Percentage</th>
    </tr>
    {''.join(
        f"<tr><td>{k}</td><td>{v['percentage']}%</td></tr>"
        for k, v in evaluation.section_analysis.items()
    )}
  </table>

  <h2>Skill Analysis</h2>
  <table>
    <tr>
      <th>Skill</th>
      
      <th>Percentage</th>
    </tr>
    {''.join(
        f"<tr><td>{k}</td><td>{v['percentage']}%</td></tr>"
        for k, v in evaluation.skill_analysis.items()
    )}
  </table>

  <h2>Difficulty Analysis</h2>
  <table>
    <tr>
      <th>Difficulty</th>
      <th>Questions</th>
      <th>Correct</th>
      <th>Percentage</th>
    </tr>
    {''.join(
        f"<tr><td>{k}</td><td>{v['questions']}</td><td>{v['correct']}</td><td>{v['percentage']}%</td></tr>"
        for k, v in evaluation.difficulty_analysis.items()
    )}
  </table>

  <h2>Question Details</h2>
  <table>
    <tr>
      <th>Question</th>
      <th>Type</th>
      <th>Difficulty</th>
      <th>Attempted</th>
      <th>Score</th>
    </tr>
    {''.join(
        f"<tr>"
        f"<td>{q['title']}</td>"
        f"<td>{q['type']}</td>"
        f"<td>{q['difficulty']}</td>"
        f"<td>{'Yes' if q['attempted'] else 'No'}</td>"
        f"<td>{1 if q['score'] > 0 else 0}</td>"
        f"</tr>"
        for q in questions
    )}
  </table>

  <div class="footer">
    This report is system generated and confidential.
  </div>

</body>
</html>
"""

def render_report_html(evaluation, student, test, questions):
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
      font-size: 24px;
    }}

    h2 {{
      color: #444;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-top: 30px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }}

    th, td {{
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }}

    th {{
      background-color: #f3f4f6;
    }}

    .summary {{
      display: flex;
      gap: 20px;
      margin-top: 15px;
    }}

    .card {{
      border: 1px solid #ddd;
      padding: 12px;
      width: 25%;
      text-align: center;
    }}

    .score {{
      font-size: 22px;
      color: #16a34a;
      font-weight: bold;
    }}

    .footer {{
      margin-top: 40px;
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

  <div class="summary">
    <div class="card">
      <div>Total Score</div>
      <div class="score">{evaluation.total_score}/{evaluation.max_score}</div>
    </div>
    <div class="card">
      <div>Percentage</div>
      <div class="score">{round(evaluation.percentage, 2)}%</div>
    </div>
    <div class="card">
      <div>Skill Level</div>
      <div class="score">{evaluation.level}</div>
    </div>
    <div class="card">
      <div>Time Taken</div>
      <div class="score">{evaluation.time_taken_sec}s</div>
    </div>
  </div>

  <h2>Section Analysis</h2>
  <table>
    <tr>
      <th>Section</th>
      <th>Score</th>
    </tr>
    {''.join(
        f"<tr><td>{k}</td><td>{sum(v)}</td></tr>"
        for k, v in evaluation.section_analysis.items()
    )}
  </table>

  <h2>Skill Analysis</h2>
  <table>
    <tr>
      <th>Skill</th>
      <th>Score</th>
    </tr>
    {''.join(
        f"<tr><td>{k}</td><td>{sum(v)}</td></tr>"
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
        f"<tr>"
        f"<td>{k}</td>"
        f"<td>{v['questions']}</td>"
        f"<td>{v['correct']}</td>"
        f"<td>{round(v['percentage'], 2)}%</td>"
        f"</tr>"
        for k, v in evaluation.difficulty_analysis.items()
    )}
  </table>

  <h2>Proctoring Summary</h2>
  <table>
    <tr>
      <th>Enabled</th>
      <th>Window Violations</th>
      <th>Time Violations</th>
    </tr>
    <tr>
      <td>{evaluation.proctoring_analysis.get("enabled")}</td>
      <td>{evaluation.proctoring_analysis.get("window_violations")}</td>
      <td>{evaluation.proctoring_analysis.get("time_violations")}</td>
    </tr>
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
        f"<td>{q['score']}</td>"
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

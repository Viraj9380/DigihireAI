import requests
import time

JUDGE0_URL = "https://ce.judge0.com"
HEADERS = {"Content-Type": "application/json"}

def create_submission(source_code: str, language_id: int, stdin: str = ""):
    payload = {
        "source_code": source_code,
        "language_id": language_id,
        "stdin": stdin,
    }

    r = requests.post(
        f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=false",
        json=payload,
        headers=HEADERS,
        timeout=30
    )
    r.raise_for_status()
    return r.json()["token"]


def get_result(token: str):
    for _ in range(25):
        r = requests.get(
            f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false",
            headers=HEADERS,
            timeout=15
        )
        r.raise_for_status()
        result = r.json()

        status = result.get("status", {}).get("description")
        if status not in ("In Queue", "Processing"):
            return result

        time.sleep(1)

    return {"status": {"description": "Timeout"}}

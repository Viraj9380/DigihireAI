# app/services/timing_utils.py
def coding_time_by_difficulty(difficulty: str) -> int:
    mapping = {
        "Easy": 10,
        "Medium": 15,
        "Hard": 20
    }
    return mapping.get(difficulty, 15)

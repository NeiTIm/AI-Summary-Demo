import json
import re
import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"


def extract_tasks(messages: list[dict]) -> dict:

    conversation_text = "\n".join(
        f"{message['sender']}: {message['content']}"
        for message in messages
    )

    prompt = f"""
Bạn là AI hỗ trợ quản lý công việc trong hệ thống CompanyChat.

Hãy phân tích cuộc trò chuyện dưới đây và TRÍCH XUẤT các công việc,
nhiệm vụ hoặc hành động cần thực hiện.

QUY TẮC:

1. Chỉ trích xuất công việc thực sự xuất hiện trong cuộc trò chuyện.
2. Không tự bịa thêm công việc.
3. Nếu không xác định được người thực hiện thì để null.
4. Nếu không có deadline thì để null.
5. Nếu công việc đã hoàn thành thì status là "Completed".
6. Nếu công việc đang cần thực hiện thì status là "Pending".
7. Nếu công việc đang được thực hiện thì status là "InProgress".
8. Không biến câu hỏi hoặc cuộc trò chuyện thông thường thành task.
9. Có thể có nhiều task.
10. Kết quả PHẢI là JSON hợp lệ.
11. KHÔNG giải thích.
12. KHÔNG thêm markdown.
13. KHÔNG thêm ```json.
14. Chỉ trả về đúng một JSON object.

Cấu trúc bắt buộc:

{{
    "tasks": [
        {{
            "title": "...",
            "assignee": "...",
            "deadline": null,
            "status": "Pending"
        }}
    ]
}}

Nếu không có task:

{{
    "tasks": []
}}

CUỘC TRÒ CHUYỆN:

{conversation_text}
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
        },
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    raw_result = data["response"].strip()

    # ==========================================
    # CLEAN AI RESPONSE
    # ==========================================

    # Remove markdown code block nếu AI vẫn trả về
    raw_result = re.sub(
        r"```json\s*",
        "",
        raw_result,
        flags=re.IGNORECASE
    )

    raw_result = re.sub(
        r"```\s*",
        "",
        raw_result
    )

    raw_result = raw_result.strip()

    # ==========================================
    # EXTRACT JSON OBJECT
    # ==========================================

    json_start = raw_result.find("{")
    json_end = raw_result.rfind("}")

    if json_start == -1 or json_end == -1:
        raise ValueError(
            f"AI did not return valid JSON: {raw_result}"
        )

    json_text = raw_result[
        json_start:json_end + 1
    ]

    try:
        result = json.loads(json_text)

    except json.JSONDecodeError as ex:
        raise ValueError(
            f"AI returned invalid JSON: {raw_result}"
        ) from ex

    # ==========================================
    # VALIDATE RESULT
    # ==========================================

    if not isinstance(result, dict):
        raise ValueError(
            "AI result must be a JSON object."
        )

    if "tasks" not in result:
        raise ValueError(
            "AI result does not contain 'tasks'."
        )

    if not isinstance(result["tasks"], list):
        raise ValueError(
            "'tasks' must be a list."
        )

    return result
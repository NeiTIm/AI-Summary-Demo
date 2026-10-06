import json
import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"


def build_summary_prompt(messages: list[dict]) -> str:

    conversation_text = "\n".join(
        f"{message['sender']}: {message['content']}"
        for message in messages
    )

    prompt = f"""
Bạn là AI hỗ trợ tóm tắt cuộc trò chuyện trong hệ thống CompanyChat.

Hãy phân tích cuộc trò chuyện dưới đây và trả lời bằng tiếng Việt.

Yêu cầu:
1. Tóm tắt ngắn gọn nội dung chính.
2. Xác định các vấn đề đang được thảo luận.
3. Liệt kê các công việc cần làm tiếp theo nếu có.
4. Không tự bịa thêm thông tin không xuất hiện trong cuộc trò chuyện.

Cuộc trò chuyện:

{conversation_text}

Hãy trả lời theo format:

TÓM TẮT:
...

VẤN ĐỀ:
- ...

CÔNG VIỆC TIẾP THEO:
- ...
"""

    return prompt


def stream_summary(messages: list[dict]):

    prompt = build_summary_prompt(messages)

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": True,
        },
        stream=True,
        timeout=120,
    )

    response.raise_for_status()

    for line in response.iter_lines(
        decode_unicode=True
    ):

        if not line:
            continue

        try:
            data = json.loads(line)

        except json.JSONDecodeError:
            continue

        chunk = data.get("response", "")

        if chunk:
            yield chunk

        if data.get("done", False):
            break
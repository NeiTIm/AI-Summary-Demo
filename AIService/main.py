from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from services.summarizer import stream_summary
from services.task_extractor import extract_tasks


app = FastAPI(
    title="AI Summary Service",
    version="1.0.0",
)


class ChatMessage(BaseModel):
    sender: str
    content: str


class SummarizeRequest(BaseModel):
    messages: list[ChatMessage]


class SummarizeResponse(BaseModel):
    summary: str


@app.get("/")
def root():
    return {
        "message": "AI Summary Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# =========================================================
# STREAMING SUMMARY
# =========================================================

@app.post("/summarize")
def summarize(request: SummarizeRequest):

    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail="Messages cannot be empty."
        )

    messages = [
        {
            "sender": message.sender,
            "content": message.content,
        }
        for message in request.messages
    ]

    return StreamingResponse(
        stream_summary(messages),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# =========================================================
# EXTRACT TASKS
# =========================================================

@app.post("/extract-tasks")
def extract_tasks_endpoint(request: SummarizeRequest):

    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail="Messages cannot be empty."
        )

    messages = [
        {
            "sender": message.sender,
            "content": message.content,
        }
        for message in request.messages
    ]

    try:
        tasks = extract_tasks(messages)

        return tasks

    except Exception as ex:
        raise HTTPException(
            status_code=500,
            detail=str(ex)
        )
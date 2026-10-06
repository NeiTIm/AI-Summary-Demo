const API_URL = "http://localhost:5001/api";

/* =========================================================
   GET CONVERSATION MESSAGES
========================================================= */

export async function getConversationMessages(conversationId) {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages`,
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Không thể tải conversation.");
  }

  return response.json();
}

/* =========================================================
   AI SUMMARY - STREAMING
========================================================= */

export async function summarizeConversation(conversationId, onChunk) {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/summary`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Không thể tạo AI summary.");
  }

  if (!response.body) {
    throw new Error("Trình duyệt không hỗ trợ streaming response.");
  }

  const reader = response.body.getReader();

  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, {
      stream: true,
    });

    if (chunk) {
      onChunk(chunk);
    }
  }

  const finalChunk = decoder.decode();

  if (finalChunk) {
    onChunk(finalChunk);
  }
}

/* =========================================================
   AI TASK EXTRACTION
========================================================= */

export async function extractConversationTasks(conversationId) {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/tasks`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(error?.message || "Không thể phân tích công việc.");
  }

  return response.json();
}

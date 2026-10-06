import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getConversationMessages,
  summarizeConversation,
  extractConversationTasks,
} from "./services/api";

import "./App.css";


/* =========================================================
   APP
========================================================= */

function App() {
  const conversationId = 1;

  /* =======================================================
     REFS
  ======================================================= */

  const summaryRef = useRef(null);
  const taskRef = useRef(null);


  /* =======================================================
     CONVERSATION
  ======================================================= */

  const [conversation, setConversation] =
    useState(null);

  const [loadingMessages, setLoadingMessages] =
    useState(true);


  /* =======================================================
     AI SUMMARY
  ======================================================= */

  const [summary, setSummary] =
    useState("");

  const [loadingSummary, setLoadingSummary] =
    useState(false);


  /* =======================================================
     AI TASKS
  ======================================================= */

  const [tasks, setTasks] =
    useState([]);

  const [loadingTasks, setLoadingTasks] =
    useState(false);


  /* =======================================================
     ERROR
  ======================================================= */

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD CONVERSATION
  ======================================================= */

  useEffect(() => {
    async function loadConversation() {
      try {
        setLoadingMessages(true);

        setError("");

        const data =
          await getConversationMessages(
            conversationId
          );

        setConversation(data);

      } catch (err) {
        setError(
          err.message ||
            "Không thể tải conversation."
        );

      } finally {
        setLoadingMessages(false);
      }
    }

    loadConversation();
  }, []);


  /* =======================================================
     AI SUMMARY - STREAMING
  ======================================================= */

  async function handleSummary() {
    try {
      setLoadingSummary(true);

      setError("");

      // Xóa summary cũ trước khi bắt đầu stream
      setSummary("");

      await summarizeConversation(
        conversationId,
        (chunk) => {
          setSummary(
            (previous) =>
              previous + chunk
          );
        }
      );

    } catch (err) {
      setError(
        err.message ||
          "Không thể tạo AI summary."
      );

    } finally {
      setLoadingSummary(false);
    }
  }


  /* =======================================================
     AI TASK EXTRACTION
  ======================================================= */

  async function handleExtractTasks() {
    try {
      setLoadingTasks(true);

      setError("");

      const data =
        await extractConversationTasks(
          conversationId
        );

      setTasks(data.tasks || []);

    } catch (err) {
      setError(
        err.message ||
          "Không thể phân tích công việc."
      );

    } finally {
      setLoadingTasks(false);
    }
  }


  /* =======================================================
     AI NAVIGATION
  ======================================================= */

  function scrollToSummary() {
    summaryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }


  function scrollToTasks() {
    taskRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }


  /* =======================================================
     LOADING CONVERSATION
  ======================================================= */

  if (loadingMessages) {
    return (
      <div className="app">

        <div className="page-loading">

          <div className="loading-spinner" />

          <h2>
            Đang tải conversation...
          </h2>

          <p>
            Đang lấy dữ liệu từ ASP.NET Core API.
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="app">

      {/* ===================================================
          TOPBAR
      =================================================== */}

      <header className="topbar">

        <div className="brand-section">

          <div className="brand-icon">
            ✨
          </div>

          <div>

            <div className="brand">
              AI Summary Demo
            </div>

            <div className="brand-subtitle">
              ASP.NET Core + Python + Ollama
            </div>

          </div>

        </div>


        <div className="ai-status">

          <span className="status-dot" />

          <span>
            AI Online
          </span>

        </div>

      </header>


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="main-container">


        {/* =================================================
            CONVERSATION PANEL
        ================================================= */}

        <section className="conversation-panel">


          {/* ===============================================
              CONVERSATION HEADER
          =============================================== */}

          <div className="conversation-header">

            <div className="conversation-info">

              <div className="conversation-icon">
                #
              </div>

              <div>

                <h1>
                  {conversation?.conversationName}
                </h1>

                <div className="conversation-meta">

                  <span className="type-badge">
                    {conversation?.conversationType}
                  </span>

                  <span>
                    {conversation?.messageCount} messages
                  </span>

                </div>

              </div>

            </div>


            <button
              className="ai-button"
              onClick={handleSummary}
              disabled={loadingSummary}
            >

              {loadingSummary ? (
                <>
                  <span className="button-spinner" />

                  AI đang phân tích...
                </>
              ) : (
                <>
                  <span>
                    ✨
                  </span>

                  Tóm tắt bằng AI
                </>
              )}

            </button>

          </div>


          {/* ===============================================
              MESSAGE LIST
          =============================================== */}

          <div className="messages">

            {conversation?.messages?.map(
              (message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  index={index}
                />
              )
            )}

          </div>

        </section>


        {/* =================================================
            RIGHT AI SIDEBAR
        ================================================= */}

        <aside className="ai-sidebar">


          {/* ===============================================
              AI NAVIGATION
          =============================================== */}

          <div className="ai-navigation">

            <button
              className="ai-navigation-button"
              onClick={scrollToSummary}
            >

              <span>
                ✨
              </span>

              Summary

            </button>


            <button
              className="ai-navigation-button"
              onClick={scrollToTasks}
            >

              <span>
                📋
              </span>

              Công việc

            </button>

          </div>


          {/* ===============================================
              AI SUMMARY PANEL
          =============================================== */}

          <section
            className="summary-panel"
            ref={summaryRef}
          >


            {/* =============================================
                SUMMARY HEADER
            ============================================= */}

            <div className="summary-header">

              <div className="summary-heading">

                <div className="summary-icon">
                  ✨
                </div>

                <div>

                  <div className="summary-title">
                    AI Summary
                  </div>

                  <div className="summary-subtitle">
                    Powered by Ollama
                  </div>

                </div>

              </div>


              {summary &&
                !loadingSummary && (
                  <div className="generated-badge">
                    Generated
                  </div>
                )}

            </div>


            {/* =============================================
                EMPTY SUMMARY
            ============================================= */}

            {!summary &&
              !loadingSummary && (

                <div className="empty-summary">

                  <div className="empty-icon">
                    ✨
                  </div>

                  <h2>
                    Chưa có bản tóm tắt
                  </h2>

                  <p>

                    Nhấn nút{" "}

                    <strong>
                      "Tóm tắt bằng AI"
                    </strong>{" "}

                    để AI phân tích cuộc trò chuyện.

                  </p>


                  <div className="pipeline">

                    <div className="pipeline-item">

                      <span>
                        1
                      </span>

                      SQL Server

                    </div>


                    <div className="pipeline-arrow">
                      →
                    </div>


                    <div className="pipeline-item">

                      <span>
                        2
                      </span>

                      ASP.NET

                    </div>


                    <div className="pipeline-arrow">
                      →
                    </div>


                    <div className="pipeline-item">

                      <span>
                        3
                      </span>

                      Python

                    </div>


                    <div className="pipeline-arrow">
                      →
                    </div>


                    <div className="pipeline-item">

                      <span>
                        4
                      </span>

                      Ollama

                    </div>

                  </div>

                </div>
              )}


            {/* =============================================
                AI LOADING
            ============================================= */}

            {loadingSummary &&
              !summary && (

                <div className="ai-loading">

                  <div className="large-spinner" />

                  <h2>
                    AI đang phân tích...
                  </h2>

                  <p>

                    Đang gửi{" "}

                    <strong>
                      {conversation?.messageCount}
                    </strong>{" "}

                    messages đến Ollama.

                  </p>


                  <div className="loading-steps">

                    <div className="loading-step active">

                      <span />

                      Đọc conversation

                    </div>


                    <div className="loading-step active">

                      <span />

                      Phân tích nội dung

                    </div>


                    <div className="loading-step">

                      <span />

                      Tạo summary

                    </div>

                  </div>

                </div>
              )}


            {/* =============================================
                STREAMING SUMMARY RESULT
            ============================================= */}

            {summary && (

              <div className="summary-result">

                <div className="summary-success">

                  <span className="success-icon">

                    {loadingSummary
                      ? "✨"
                      : "✓"}

                  </span>

                  {loadingSummary
                    ? "AI đang tạo summary..."
                    : "AI đã hoàn thành phân tích"}

                </div>


                <div className="summary-content">

                  <SummaryText
                    text={summary}
                  />

                </div>


                {!loadingSummary && (

                  <button
                    className="regenerate-button"
                    onClick={handleSummary}
                  >

                    ↻ Tạo lại summary

                  </button>

                )}

              </div>
            )}

          </section>


          {/* ===============================================
              AI TASK PANEL
          =============================================== */}

          <section
            className="task-panel"
            ref={taskRef}
          >


            {/* =============================================
                TASK HEADER
            ============================================= */}

            <div className="task-panel-header">

              <div>

                <div className="task-panel-title">
                  Công việc được phát hiện
                </div>

                <div className="task-panel-subtitle">
                  AI phân tích các nhiệm vụ từ cuộc trò chuyện
                </div>

              </div>


              <button
                className="task-analyze-button"
                onClick={handleExtractTasks}
                disabled={loadingTasks}
              >

                {loadingTasks
                  ? "Đang phân tích..."
                  : "✨ Phân tích công việc"}

              </button>

            </div>


            {/* =============================================
                TASK LOADING
            ============================================= */}

            {loadingTasks && (

              <div className="task-loading">

                <div className="task-spinner" />

                <span>
                  AI đang tìm kiếm các công việc...
                </span>

              </div>

            )}


            {/* =============================================
                TASK EMPTY
            ============================================= */}

            {!loadingTasks &&
              tasks.length === 0 && (

                <div className="task-empty">

                  Chưa có công việc nào được phân tích.

                </div>

              )}


            {/* =============================================
                TASK LIST
            ============================================= */}

            {!loadingTasks &&
              tasks.length > 0 && (

                <div className="task-list">

                  {tasks.map(
                    (task, index) => (

                      <TaskCard
                        key={`${task.title}-${index}`}
                        task={task}
                      />

                    )
                  )}

                </div>

              )}

          </section>

        </aside>

      </main>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="error-toast">

          <div className="error-icon">
            !
          </div>


          <div>

            <strong>
              Có lỗi xảy ra
            </strong>

            <p>
              {error}
            </p>

          </div>


          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   MESSAGE ITEM
========================================================= */

function MessageItem({
  message,
  index,
}) {

  const avatar =
    message.sender
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase();


  return (
    <div className="message">

      <div className="message-number">
        {index + 1}
      </div>


      <div className="avatar">
        {avatar || "?"}
      </div>


      <div className="message-content">

        <div className="message-top">

          <strong>
            {message.sender}
          </strong>

          <span>
            {formatDateTime(message.sentAt)}
          </span>

        </div>


        <div className="message-text">
          {message.content}
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   TASK CARD
========================================================= */

function TaskCard({ task }) {

  const statusClass =
    getTaskStatusClass(task.status);

  const statusLabel =
    getTaskStatusLabel(task.status);


  return (
    <div className="task-card">

      <div className="task-card-main">

        <div className="task-title">
          {task.title}
        </div>


        <div className="task-meta">

          {task.assignee && (
            <span>
              👤 {task.assignee}
            </span>
          )}


          {task.deadline && (
            <span>
              🕐 {task.deadline}
            </span>
          )}

        </div>

      </div>


      <span
        className={`task-status ${statusClass}`}
      >
        {statusLabel}
      </span>

    </div>
  );
}


/* =========================================================
   TASK STATUS LABEL
========================================================= */

function getTaskStatusLabel(status) {

  switch (status) {

    case "Completed":
      return "Đã hoàn thành";

    case "InProgress":
      return "Đang thực hiện";

    case "Pending":
    default:
      return "Chờ thực hiện";
  }
}


/* =========================================================
   TASK STATUS CLASS
========================================================= */

function getTaskStatusClass(status) {

  switch (status) {

    case "Completed":
      return "completed";

    case "InProgress":
      return "in-progress";

    case "Pending":
    default:
      return "pending";
  }
}


/* =========================================================
   SUMMARY TEXT
========================================================= */

function SummaryText({ text }) {

  const lines =
    text.split("\n");


  return (
    <div>

      {lines.map((line, index) => {

        const trimmed =
          line.trim();


        if (!trimmed) {

          return (
            <div
              key={index}
              className="summary-space"
            />
          );
        }


        const upper =
          trimmed.toUpperCase();


        if (
          upper.startsWith("TÓM TẮT")
        ) {

          return (
            <h3 key={index}>
              {trimmed}
            </h3>
          );
        }


        if (
          upper.startsWith("VẤN ĐỀ")
        ) {

          return (
            <h3 key={index}>
              {trimmed}
            </h3>
          );
        }


        if (
          upper.startsWith("CÔNG VIỆC")
        ) {

          return (
            <h3 key={index}>
              {trimmed}
            </h3>
          );
        }


        if (
          trimmed.startsWith("-")
        ) {

          return (
            <div
              key={index}
              className="summary-bullet"
            >
              {trimmed}
            </div>
          );
        }


        return (
          <p key={index}>
            {trimmed}
          </p>
        );

      })}

    </div>
  );
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDateTime(value) {

  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }


  return date.toLocaleString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


/* =========================================================
   EXPORT
========================================================= */

export default App;
function getStatusLabel(status) {
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


function getStatusClass(status) {
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


export default function TaskPanel({
  tasks,
  loading,
  error,
  onExtract,
}) {
  return (
    <section className="task-panel">

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
          onClick={onExtract}
          disabled={loading}
        >
          {loading
            ? "Đang phân tích..."
            : "✨ Phân tích công việc"}
        </button>

      </div>


      {error && (
        <div className="task-error">
          {error}
        </div>
      )}


      {!loading && !error && tasks.length === 0 && (
        <div className="task-empty">
          Chưa có công việc nào được phân tích.
        </div>
      )}


      {tasks.length > 0 && (
        <div className="task-list">

          {tasks.map((task, index) => (
            <div
              className="task-card"
              key={`${task.title}-${index}`}
            >

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
                className={`task-status ${getStatusClass(
                  task.status
                )}`}
              >
                {getStatusLabel(task.status)}
              </span>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}
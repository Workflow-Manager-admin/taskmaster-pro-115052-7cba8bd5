import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * TaskList - Renders the list of all tasks with edit, delete, and completion UI.
 *
 * Props:
 * - tasks (array)
 * - loading (bool)
 * - error (string)
 * - onEditTask(taskId)
 * - onDeleteTask(taskId)
 * - onToggleCompleted(taskId)
 */
function TaskList({
  tasks,
  loading,
  error,
  onEditTask,
  onDeleteTask,
  onToggleCompleted,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // For highlighting overdue
  const isOverdue = (dueDate, completed) => {
    if (!dueDate || completed) return false;
    try {
      return new Date(dueDate) < new Date(new Date().toDateString());
    } catch {
      return false;
    }
  };

  // Show spinner/placeholder/etc.
  return (
    <section className="task-list-section">
      <h2 className="section-title">Tasks</h2>
      {error && (
        <div style={{ color: "#e53935", marginBottom: 6 }}>{error}</div>
      )}
      {loading && (
        <div className="task-list-placeholder">
          <p>Loading tasks...</p>
        </div>
      )}
      {!loading && (!tasks || tasks.length === 0) && (
        <div className="task-list-placeholder">
          <p>No tasks yet. Enjoy your productivity!</p>
        </div>
      )}
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: "12px 14px 10px 14px",
              marginBottom: 15,
              background: "var(--bg-primary)",
              opacity: task.completed ? 0.6 : 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={!!task.completed}
                onChange={() => onToggleCompleted(task.id)}
                style={{
                  accentColor: task.completed
                    ? "#4caf50"
                    : isOverdue(task.due_date, task.completed)
                    ? "#e53935"
                    : "#1976d2",
                  cursor: loading ? "not-allowed" : "pointer",
                  width: 18,
                  height: 18,
                }}
                disabled={loading}
                aria-label="Mark as completed"
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontWeight: 550,
                    fontSize: "1.05rem",
                    textDecoration: task.completed ? "line-through" : "none",
                    color: isOverdue(task.due_date, task.completed)
                      ? "#e53935"
                      : "inherit",
                  }}
                >
                  {task.title}
                </span>
                {task.category && (
                  <span
                    style={{
                      background: "#eceff1",
                      color: "#1976d2",
                      borderRadius: 5,
                      fontSize: "0.92rem",
                      fontWeight: 500,
                      padding: "2px 8px",
                      marginLeft: 9,
                    }}
                  >
                    {task.category}
                  </span>
                )}
              </div>
              <div>
                <button
                  aria-label="Edit"
                  onClick={() => onEditTask(task.id)}
                  title="Edit"
                  disabled={loading}
                  style={{
                    background: "#1a75ff",
                    color: "#fff",
                    border: 0,
                    borderRadius: 5,
                    padding: "3px 13px",
                    fontWeight: "bold",
                    marginRight: 6,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  ✎
                </button>
                <button
                  aria-label="Delete"
                  onClick={() => setDeleteConfirmId(task.id)}
                  title="Delete"
                  disabled={loading}
                  style={{
                    background: "#e53935",
                    color: "#fff",
                    border: 0,
                    borderRadius: 5,
                    padding: "3px 11px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
            {task.description && (
              <div
                style={{
                  marginLeft: 32,
                  color: "#888",
                  marginTop: 3,
                  paddingBottom: 2,
                  fontSize: "0.95rem",
                }}
              >
                {task.description}
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 32,
                marginTop: 2,
                gap: 20,
                fontSize: "0.91rem",
              }}
            >
              {task.due_date && (
                <span
                  style={{
                    color: isOverdue(task.due_date, task.completed)
                      ? "#e53935"
                      : "#1976d2",
                  }}
                >
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              <span>
                Priority:{" "}
                <b
                  style={{
                    color:
                      task.priority === "high"
                        ? "#e53935"
                        : task.priority === "low"
                        ? "#888"
                        : "#424242",
                  }}
                >
                  {capitalize(task.priority || "normal")}
                </b>
              </span>
              {task.completed && (
                <span style={{ color: "#4caf50" }}>Completed</span>
              )}
            </div>
            {/* Confirmation dialog for delete */}
            {deleteConfirmId === task.id && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(32,32,32,0.78)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  zIndex: 10,
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    background: "#282c34",
                    borderRadius: 7,
                    padding: "19px 29px",
                    boxShadow: "0 0 12px #1118",
                    border: "1px solid #444",
                    textAlign: "center",
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    Delete this task? <br />
                    <span style={{ color: "#ffcccb", fontWeight: 500 }}>
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDeleteConfirmId(null);
                      onDeleteTask(task.id);
                    }}
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      padding: "5px 19px",
                      fontWeight: "bold",
                      marginRight: 12,
                      fontSize: 15,
                    }}
                    disabled={loading}
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    style={{
                      background: "#999",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      padding: "5px 17px",
                      fontWeight: "normal",
                      fontSize: 15,
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TaskList;

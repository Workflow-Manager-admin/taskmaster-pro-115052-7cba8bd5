import React, { useState, useEffect } from "react";
import "./App.css";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";

// PUBLIC_INTERFACE
function Header({ theme, toggleTheme }) {
  /** Header with app title and theme toggle button. */
  return (
    <header className="header">
      <h1 className="app-title">Taskmaster Pro</h1>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </header>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Main app with responsive structure, header, theme toggle, routing skeleton,
   * and placeholders for TaskList and TaskForm.
   */
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

  return (
    <div className="App">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <div className="form-controls-container">
          <TaskForm />
          {/* Category/filter controls placeholder, will be implemented later */}
          <section className="task-controls-section">
            <div className="task-controls-placeholder">
              <p>Category & Filter Controls will appear here.</p>
            </div>
          </section>
        </div>
        <TaskList />
      </main>
    </div>
  );
}

export default App;

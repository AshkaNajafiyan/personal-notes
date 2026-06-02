import { NavLink, Link, useNavigate } from "react-router-dom";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 4.25a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Zm0 13.5a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V18.5a.75.75 0 0 1 .75-.75ZM4.25 12a.75.75 0 0 1 .75-.75h1.25a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Zm13.5 0a.75.75 0 0 1 .75-.75h1.25a.75.75 0 0 1 0 1.5H18.5a.75.75 0 0 1-.75-.75ZM6.22 6.22a.75.75 0 0 1 1.06 0l.88.88a.75.75 0 0 1-1.06 1.06l-.88-.88a.75.75 0 0 1 0-1.06Zm9.62 9.62a.75.75 0 0 1 1.06 0l.88.88a.75.75 0 1 1-1.06 1.06l-.88-.88a.75.75 0 0 1 0-1.06Zm1.94-9.62a.75.75 0 0 1 0 1.06l-.88.88a.75.75 0 0 1-1.06-1.06l.88-.88a.75.75 0 0 1 1.06 0ZM7.1 16.72a.75.75 0 0 1 0 1.06l-.88.88a.75.75 0 1 1-1.06-1.06l.88-.88a.75.75 0 0 1 1.06 0ZM12 7.25A4.75 4.75 0 1 1 7.25 12 4.76 4.76 0 0 1 12 7.25Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.2 14.7A8.75 8.75 0 0 1 9.3 3.8a.75.75 0 0 0-.92-.9 9.75 9.75 0 1 0 11.9 12 .75.75 0 0 0-.08-.2Z"
      />
    </svg>
  );
}

export default function Navbar({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="nav-shell">
      <div className="nav-inner">
        <Link to="/notes" className="brand">
          <span className="brand-mark">My Notes</span>
          <span className="brand-subtitle">Minimal personal notes</span>
        </Link>

        <div className="nav-links">
          {token ? (
            <>
              <NavLink
                to="/notes"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Notes
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Create
              </NavLink>
              <button type="button" onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Register
              </NavLink>
            </>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            className="btn btn-secondary icon-btn"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}

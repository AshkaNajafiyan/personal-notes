import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate("/notes");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="surface auth-card stack">
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-copy">Access your notes and keep everything in one place.</p>
        </div>

        {error && <p className="notice notice-error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            <p className="auth-footnote">
              New here? <Link to="/register" className="text-link">Create an account</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

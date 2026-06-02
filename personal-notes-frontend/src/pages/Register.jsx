import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
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
      await registerUser(form.username, form.email, form.password);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="surface auth-card stack">
        <div>
          <p className="page-kicker">Account</p>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-copy">Set up a clean workspace for notes, drafts, and short-term thinking.</p>
        </div>

        {error && <p className="notice notice-error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <span className="label">Username</span>
            <input
              className="input"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="username"
              required
            />
          </label>

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
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </button>
            <p className="auth-footnote">
              Already have an account? <Link to="/login" className="text-link">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

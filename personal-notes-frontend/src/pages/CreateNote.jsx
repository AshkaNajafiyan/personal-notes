import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNote } from "../api/notes";

const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export default function CreateNote() {
  const [note, setNote] = useState({ title: "", content: "", tags: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setNote((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await createNote(note.title, note.content, parseTags(note.tags));
      navigate("/notes");
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/login");
        return;
      }
      setError(err.message || "Failed to create note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Notes</p>
          <h1 className="page-title">Create note</h1>
          <p className="page-subtitle">Write quickly, keep it clean, and add tags only if they help later.</p>
        </div>
      </div>

      <div className="surface panel">
        {error && <p className="notice notice-error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <span className="label">Title</span>
            <input
              className="input"
              name="title"
              value={note.title}
              onChange={handleChange}
              placeholder="New idea"
              required
            />
          </label>

          <label className="field">
            <span className="label">Content</span>
            <textarea
              className="textarea"
              name="content"
              value={note.content}
              onChange={handleChange}
              placeholder="Write your note..."
              required
            />
          </label>

          <label className="field">
            <span className="label">Tags</span>
            <input
              className="input"
              name="tags"
              value={note.tags}
              onChange={handleChange}
              placeholder="research, design, follow-up"
            />
            <span className="helper">Separate tags with commas.</span>
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save note"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

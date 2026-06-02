import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNote, updateNote } from "../api/notes";

const parseTags = (value) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export default function EditNote() {
  const { id } = useParams();
  const [note, setNote] = useState({ title: "", content: "", tags: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const data = await getNote(id);
        if (ignore) return;

        setNote({
          title: data.title ?? "",
          content: data.content ?? "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        });
      } catch (err) {
        if (err.message === "Unauthorized") {
          navigate("/login");
          return;
        }

        if (!ignore) {
          setError(err.message || "Failed to load note.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [id, navigate]);

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
      await updateNote(id, note.title, note.content, parseTags(note.tags));
      navigate("/notes");
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/login");
        return;
      }
      setError(err.message || "Failed to update note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Notes</p>
          <h1 className="page-title">Edit note</h1>
          <p className="page-subtitle">Keep the layout simple and the content easy to scan later.</p>
        </div>
      </div>

      <div className="surface panel">
        {loading ? (
          <p className="muted">Loading note...</p>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            {error && <p className="notice notice-error">{error}</p>}

            <label className="field">
              <span className="label">Title</span>
              <input
                className="input"
                name="title"
                value={note.title}
                onChange={handleChange}
                placeholder="Note title"
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
                placeholder="Note content"
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
                {submitting ? "Updating..." : "Update note"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteNote, getNotes, searchNotes } from "../api/notes";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const searchActive = useMemo(() => query.trim().length > 0, [query]);

  useEffect(() => {
    let ignore = false;

    const loadNotes = async () => {
      setLoading(true);

      try {
        const data = searchActive ? await searchNotes(query) : await getNotes(page);
        if (ignore) return;

        if (searchActive) {
          setNotes(Array.isArray(data) ? data : []);
          setTotal(Array.isArray(data) ? data.length : 0);
          setTotalPages(1);
        } else {
          setNotes(data.notes || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }

        setError("");
      } catch (err) {
        if (ignore) return;

        if (err.message === "Unauthorized") {
          navigate("/login");
          return;
        }

        setError(err.message || "Could not load notes.");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadNotes();

    return () => {
      ignore = true;
    };
  }, [navigate, page, query, searchActive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;

    try {
      await deleteNote(id);
      const data = searchActive ? await searchNotes(query) : await getNotes(page);

      if (searchActive) {
        setNotes(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
      } else {
        setNotes(data.notes || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }

      setError("");
    } catch (err) {
      if (err.message === "Unauthorized") {
        navigate("/login");
        return;
      }

      setError(err.message || "Failed to delete note.");
    }
  };

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setPage(1);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Workspace</p>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">
            {searchActive
              ? "Showing filtered results."
              : "A quiet workspace for short drafts, references, and ideas."}
          </p>
        </div>

        <div className="toolbar">
          <div className="search-bar">
            <input
              className="input"
              type="search"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search notes"
              aria-label="Search notes"
            />
          </div>
          <Link to="/create" className="btn btn-primary">
            + New note
          </Link>
        </div>
      </div>

      {error && <p className="notice notice-error">{error}</p>}

      <div className="meta-row">
        <span className="page-count">
          {loading ? "Loading..." : `${total} ${total === 1 ? "note" : "notes"}`}
        </span>
        {searchActive && (
          <button type="button" className="btn btn-secondary" onClick={() => setQuery("")}>
            Clear search
          </button>
        )}
      </div>

      {loading ? (
        <div className="surface panel">
          <p className="muted">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map((note) => {
            const noteId = note._id || note.id;
            const tags = Array.isArray(note.tags) ? note.tags : [];

            return (
              <article key={noteId} className="surface note-card">
                <div className="note-card-head">
                  <div>
                    <h2 className="note-title">{note.title}</h2>
                    <div className="meta-row">
                      <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <p className="note-body">{note.content}</p>

                {tags.length > 0 && (
                  <div className="tag-list">
                    {tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="card-actions">
                  <Link to={`/edit/${noteId}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDelete(noteId)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2 className="note-title">No notes yet</h2>
          <p className="page-subtitle">
            Start with a short note and keep it moving. You can always refine it later.
          </p>
          <div className="form-actions" style={{ justifyContent: "center" }}>
            <Link to="/create" className="btn btn-primary">
              + Create note
            </Link>
          </div>
        </div>
      )}

      {!searchActive && totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => {
            const nextPage = index + 1;

            return (
              <button
                key={nextPage}
                type="button"
                className={nextPage === page ? "btn btn-primary" : "btn btn-secondary"}
                onClick={() => setPage(nextPage)}
              >
                {nextPage}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

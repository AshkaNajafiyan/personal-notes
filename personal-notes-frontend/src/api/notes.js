const getToken = () => localStorage.getItem("token");
const apiUrl = (path) => `${import.meta.env.VITE_API_BASE_URL || ""}${path}`;

const request = async (url, options = {}) => {
    const res = await fetch(apiUrl(url), options);

    if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed.");
    }

    return res.json();
};

export const getNotes = async (page = 1, limit = 10) => {
    return request(`/api/notes?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
};

export const getNote = async (id) => {
    return request(`/api/notes/${id}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
};

export const searchNotes = async (query) => {
    const q = encodeURIComponent(query.trim());
    return request(`/api/notes/search?q=${q}`, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
};

export const createNote = async (title, content, tags = []) => {
    return request("/api/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, content, tags }),
    });
};

export const updateNote = async (id, title, content, tags = []) => {
    return request(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, content, tags }),
    });
};

export const deleteNote = async (id) => {
    return request(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
    });
};

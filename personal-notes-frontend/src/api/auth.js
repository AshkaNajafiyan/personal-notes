export const getToken = () => localStorage.getItem("token");
export const setToken  = (token) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

const apiUrl = (path) => `${import.meta.env.VITE_API_BASE_URL || ""}${path}`;

export const registerUser = async (username, email, password) => {
    const url = apiUrl("/api/auth/register");

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed.");
    }

    const data = await res.json();
    return data;
};

export const login = async (email, password) => {
    const url = apiUrl("/api/auth/login");

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed.");
    }

    const data = await res.json();

    if (data.token) setToken(data.token);
    return data;
};

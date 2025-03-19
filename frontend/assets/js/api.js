const API_BASE_URL = "http://localhost:5000/api"; // Update this as needed

const apiRequest = async (endpoint, method = "GET", data = null, token = null) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error("API Request Error:", error);
        return { error: "Something went wrong!" };
    }
};

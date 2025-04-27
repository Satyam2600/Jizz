// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

// Function to get token
function getToken() {
    return localStorage.getItem("token");
}

// Function to clear authentication data
function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

// Function to handle API requests
async function apiRequest(endpoint, method, data = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add token to headers if it exists
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : null
        });

        const result = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                clearAuth();
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(result.error || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Login form handler
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Logging in...';
        }

        // Clear any existing auth data
        clearAuth();

        const response = await apiRequest("/auth/login", "POST", { email, password });

        if (response.token) {
            // Store new token and user data
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            
            // Verify token is stored
            if (!isAuthenticated()) {
                throw new Error("Failed to store authentication token");
            }

            // Redirect to feed
            window.location.href = "pages/feed.html";
        } else {
            throw new Error(response.error || "Login failed!");
        }
    } catch (error) {
        alert(error.message);
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
        }
    }
});

// Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    clearAuth();
    window.location.href = '/login.html';
});

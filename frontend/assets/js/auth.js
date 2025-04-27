// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

// Function to get token
function getToken() {
    return localStorage.getItem("token");
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
            throw new Error(result.error || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        return { error: error.message };
    }
}

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

        const response = await apiRequest("/auth/login", "POST", { email, password });

        if (response.token) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            
            // Verify token is stored
            if (isAuthenticated()) {
                window.location.href = "pages/feed.html"; // Redirect to feed
            } else {
                throw new Error("Failed to store authentication token");
            }
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

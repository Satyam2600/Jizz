async function logout() {
    try {
        // Call the logout endpoint
        const response = await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include", // Include cookies for session handling
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            // Clear all local storage items
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.href = "/login";
        } else {
            console.error("Logout failed");
            alert("Failed to logout. Please try again.");
        }
    } catch (error) {
        console.error("Error during logout:", error);
        alert("An error occurred during logout. Please try again.");
    }
}

// Export the logout function
window.logout = logout; 
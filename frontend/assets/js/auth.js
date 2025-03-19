document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await apiRequest("/auth/login", "POST", { email, password });

    if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        window.location.href = "pages/feed.html"; // Redirect to feed
    } else {
        alert(response.error || "Login failed!");
    }
});

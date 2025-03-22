document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const uidInput = document.getElementById("uid");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.querySelector(".password-toggle");

    // Password visibility toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener("click", function () {
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    }

    // Form submission handler
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            // Validate required fields
            if (!fullName || !uid || !email || !password) {
                alert("⚠ Please fill in all required fields.");
                return;
            }

            // Email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert("⚠ Enter a valid email address.");
                return;
            }

            // UID validation
            if (!/^\d+$/.test(uid)) {
                alert("⚠ UID should be numeric.");
                return;
            }

            // Password validation
            if (password.length < 6) {
                alert("⚠ Password must be at least 6 characters long.");
                return;
            }

            // Prepare data
            const userData = { fullName, uid, email, password };

            try {
                // Updated fetch URL with port 5000
                const response = await fetch("http://localhost:5000/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });

                // Handle empty response
                const text = await response.text();
                if (!text.trim()) {
                    throw new Error("Empty server response");
                }

                // Parse JSON safely
                const result = JSON.parse(text);

                if (response.ok) {
                    alert("✅ Registration successful! Redirecting...");
                    window.location.href = "login.html";
                } else {
                    alert(`⚠ Error: ${result.message || `HTTP ${response.status}`}`);
                }
            } catch (error) {
                console.error("Registration error:", error);
                alert(`⚠ Error: ${error.message || "Check your connection"}`);
            }
        });
    }
});
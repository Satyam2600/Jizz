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

            // Get input values and trim spaces
            const fullName = fullNameInput.value.trim();
            const uid = uidInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            console.log("Entered Full Name:", fullName);
            console.log("Entered UID:", uid);
            console.log("Entered Email:", email);

            // Validate required fields
            if (!fullName || !uid || !email || !password) {
                alert("⚠ Please fill in all required fields.");
                return;
            }

            // Email validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                alert("⚠ Enter a valid email address.");
                return;
            }

            // UID validation (numeric only)
            if (!/^\d+$/.test(uid)) {
                alert("⚠ UID should be numeric.");
                return;
            }

            // Password validation
            if (password.length < 6) {
                alert("⚠ Password must be at least 6 characters long.");
                return;
            }

            // Prepare data for API
            const userData = { fullName, uid, email, password };

            try {
                console.log("Sending request to API...");

                // Ensure the correct API route
                const response = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userData),
                });

                console.log("Response Status:", response.status);

                const result = await response.json();

                if (response.ok) {
                    alert("✅ Registration successful! Redirecting...");
                    window.location.href = "/login";
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
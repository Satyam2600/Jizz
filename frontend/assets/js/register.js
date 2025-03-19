document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("form");
    const passwordInput = document.querySelector("input[type='password']");
    const passwordToggle = document.querySelector(".password-toggle");

    // Password visibility toggle
    passwordToggle.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {
            passwordInput.type = "password";
        }
    });

    // Handle registration form submission
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Collect form data
        const fullName = document.querySelector("input[placeholder='Enter your full name']").value.trim();
        const uid = document.querySelector("input[placeholder='Enter your unique UID']").value.trim();
        const email = document.querySelector("input[placeholder='Enter your  email']").value.trim();
        const branch = document.querySelector("input[placeholder='Enter your branch']").value.trim();
        const year = document.querySelector("input[placeholder='Enter your year of study']").value.trim();
        const semester = document.querySelector("input[placeholder='Enter your semester']").value.trim();
        const password = passwordInput.value.trim();

        // Validate input fields
        if (!fullName || !uid || !email || !branch || !year || !semester || !password) {
            alert("Please fill in all fields.");
            return;
        }

        if (!email.includes("@")) {
            alert("Enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        // Prepare request payload
        const userData = {
            fullName,
            uid,
            email,
            branch,
            year,
            semester,
            password,
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Registration successful! Redirecting to login page...");
                window.location.href = "login.html"; // Redirect to login page
            } else {
                alert(result.message || "Registration failed. Try again.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            alert("Something went wrong. Please try again later.");
        }
    });
});

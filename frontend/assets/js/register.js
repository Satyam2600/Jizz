document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("form");
    const passwordInput = document.querySelector("input[type='password']");
    const passwordToggle = document.querySelector(".password-toggle");

    // Password visibility toggle
    passwordToggle.addEventListener("click", function () {
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });

    // Function to validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Function to validate UID (assuming UID is numeric)
    function isValidUID(uid) {
        return /^\d+$/.test(uid);
    }

    // Function to validate year (1-4)
    function isValidYear(year) {
        return /^[1-4]$/.test(year);
    }

    // Function to validate semester (1-8)
    function isValidSemester(semester) {
        return /^[1-8]$/.test(semester);
    }

    // Handle form submission
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Collect form values
        const fullName = document.querySelector("input[placeholder='Enter your full name']").value.trim();
        const uid = document.querySelector("input[placeholder='Enter your unique UID']").value.trim();
        const email = document.querySelector("input[placeholder='Enter your  email']").value.trim();
        const branch = document.querySelector("input[placeholder='Enter your branch']").value.trim();
        const year = document.querySelector("input[placeholder='Enter your year of study']").value.trim();
        const semester = document.querySelector("input[placeholder='Enter your semester']").value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        if (!fullName || !uid || !email || !branch || !year || !semester || !password) {
            alert("⚠ Please fill in all fields.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("⚠ Enter a valid email address.");
            return;
        }

        if (!isValidUID(uid)) {
            alert("⚠ UID should be numeric.");
            return;
        }

        if (!isValidYear(year)) {
            alert("⚠ Year should be between 1 to 3.");
            return;
        }

        if (!isValidSemester(semester)) {
            alert("⚠ Semester should be between 1 to 6.");
            return;
        }

        if (password.length < 6) {
            alert("⚠ Password must be at least 6 characters long.");
            return;
        }

        // Prepare user data
        const userData = { fullName, uid, email, branch, year, semester, password };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Registration successful! Redirecting to login page...");
                window.location.href = "login.html";
            } else {
                alert(`⚠ ${result.message || "Registration failed. Try again."}`);
            }
        } catch (error) {
            console.error("❌ Registration error:", error);
            alert("⚠ Something went wrong. Please try again later.");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const uidInput = document.getElementById("uid");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const rememberMe = document.getElementById("rememberMe") || { checked: false };

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });

  // Handle form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const uid = uidInput.value.trim();
    const password = passwordInput.value.trim();
    if (!uid || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    const loginData = { uid, password };
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include", // When included, the browser sends/receives session cookies.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        // Save the roll number for later use
        localStorage.setItem("uid", data.user.rollNo);
        console.log("Login successful! Redirecting to edit profile.");
        window.location.href = "/editProfile";
      } else {
        alert("Login failed: " + (data.message || data.error));
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
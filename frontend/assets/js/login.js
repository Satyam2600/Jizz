document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const uidInput = document.getElementById("uid");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const rememberMe = document.getElementById("rememberMe");

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

    // Prepare login data
    const loginData = { uid, password };

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        // Save token and user details based on "Remember Me" option
        const storage = rememberMe.checked ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("userId", data.user.id); // Store userId for future use
        storage.setItem("uid", data.user.rollNo);
        storage.setItem("email", data.user.email);

        alert("Login successful!");
        window.location.href = "/edit-Profile"; // Redirect to edit profile page
      } else {
        alert("Login failed: " + (data.message || data.error));
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  });
});
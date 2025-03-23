document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
  
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
  
      const uid = document.getElementById("uid").value.trim();
      const password = passwordInput.value.trim();
      const rememberMe = document.getElementById("rememberMe").checked;
  
      // Prepare login data
      const loginData = { uid, password };
  
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData)
        });
        const data = await response.json();
  
        if (response.ok) {
          // Save token based on "Remember Me" option
          if (rememberMe) {
            localStorage.setItem("token", data.token);
          } else {
            sessionStorage.setItem("token", data.token);
          }
          alert("Login successful!");
          window.location.href = "/frontend/pages/dashboard.html";
        } else {
          alert("Login failed: " + data.error);
        }
      } catch (error) {
        console.error("Error during login", error);
        alert("An error occurred. Please try again.");
      }
    });
  });
  
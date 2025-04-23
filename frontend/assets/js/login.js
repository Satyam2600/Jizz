document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const rollNumberInput = document.getElementById("rollNumber");
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
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const rollNumber = rollNumberInput.value.trim();
    const password = passwordInput.value.trim();
    
    console.log("Login attempt with:", {
      rollNumber,
      hasPassword: !!password
    });

    if (!rollNumber || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      console.log("Sending login request...");
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber, password })
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userFullName', data.user.fullName || '');
        localStorage.setItem('userUsername', data.user.username || '');
        localStorage.setItem('userProfilePhoto', data.user.avatar || '/assets/images/default-avatar.png');
        localStorage.setItem('userBanner', data.user.banner || '/assets/images/default-banner.jpg');
        
        // Log the stored user data for debugging
        console.log('User data stored in localStorage:', {
          fullName: data.user.fullName,
          username: data.user.username || 'Not set',
          avatar: data.user.avatar,
          banner: data.user.banner,
          isFirstLogin: data.user.isFirstLogin
        });
        
        // Redirect based on first-time login
        if (data.user.isFirstLogin) {
          console.log("First time login, redirecting to edit profile...");
          window.location.href = '/edit-profile';
        } else {
          console.log("Returning user, redirecting to dashboard...");
          window.location.href = '/dashboard';
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  });
});
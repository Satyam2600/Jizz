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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: uid, password: password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('uid', data.user.rollNo);
        localStorage.setItem('userFullName', data.user.fullName);
        localStorage.setItem('userUsername', data.user.username || data.user.rollNo);
        localStorage.setItem('userAvatar', data.user.avatar || '/assets/images/default-avatar.jpg');
        localStorage.setItem('userBanner', data.user.banner || '/assets/images/default-banner.jpg');
        
        // Store the JWT token
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token stored successfully');
        } else {
          console.error('No token found in login response');
          alert('Login successful but authentication token is missing. Please try again.');
          return;
        }
        
        // Redirect based on first login status
        if (data.isFirstLogin) {
          window.location.href = '/edit-profile';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during login');
    }
  });
});
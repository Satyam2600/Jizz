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
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNo: uid, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('uid', data.user.uid);
        localStorage.setItem('userFullName', data.user.fullName);
        localStorage.setItem('userUsername', data.user.username);
        localStorage.setItem('userAvatar', data.user.avatar);
        localStorage.setItem('userBanner', data.user.banner);
        
        // Redirect based on first login status
        if (data.user.isFirstLogin) {
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
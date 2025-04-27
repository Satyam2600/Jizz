document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const rollNumberInput = document.getElementById("rollNumber");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const rememberMe = document.getElementById("rememberMe");
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3 d-none';
  loginForm.appendChild(errorDiv);

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
    
    // Reset error message
    errorDiv.classList.add('d-none');
    errorDiv.textContent = '';
    
    const rollNumber = rollNumberInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validate inputs
    if (!rollNumber || !password) {
      showError("Please fill in all required fields.");
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // If remember me is checked, store roll number
        if (rememberMe && rememberMe.checked) {
          localStorage.setItem('rememberedRollNumber', rollNumber);
        } else {
          localStorage.removeItem('rememberedRollNumber');
        }

        // Redirect based on profileCompleted
        if (data.user && data.user.profileCompleted === false) {
          window.location.href = '/edit-profile';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        showError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("An error occurred during login. Please try again.");
    } finally {
      // Reset loading state
      submitButton.disabled = false;
      submitButton.innerHTML = 'Login';
    }
  });

  // Helper function to show error messages
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Check for remembered roll number
  const rememberedRollNumber = localStorage.getItem('rememberedRollNumber');
  if (rememberedRollNumber) {
    rollNumberInput.value = rememberedRollNumber;
    if (rememberMe) {
      rememberMe.checked = true;
    }
  }

  // Clear error message when user starts typing
  [rollNumberInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      errorDiv.classList.add('d-none');
    });
  });
}); 
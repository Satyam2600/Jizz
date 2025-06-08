// Toggle password visibility
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        }

        // Password strength checker
        function checkPasswordStrength(password) {
            const requirements = {
                length: password.length >= 8,
                upper: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };
            
            // Update requirement indicators
            document.getElementById('lengthReq').classList.toggle('valid', requirements.length);
            document.getElementById('upperReq').classList.toggle('valid', requirements.upper);
            document.getElementById('numberReq').classList.toggle('valid', requirements.number);
            document.getElementById('specialReq').classList.toggle('valid', requirements.special);
            
            // Update icons
            document.querySelectorAll('.requirement-item').forEach(item => {
                const icon = item.querySelector('i');
                if (item.classList.contains('valid')) {
                    icon.classList.replace('bi-x-circle', 'bi-check-circle');
                } else {
                    icon.classList.replace('bi-check-circle', 'bi-x-circle');
                }
            });
            
            // Calculate strength
            const strength = Object.values(requirements).filter(Boolean).length;
            const strengthBar = document.getElementById('passwordStrength');
            
            strengthBar.style.width = `${(strength / 4) * 100}%`;
            strengthBar.style.backgroundColor = 
                strength === 0 ? '#dc3545' :
                strength === 1 ? '#ffc107' :
                strength === 2 ? '#fd7e14' :
                strength === 3 ? '#20c997' :
                '#198754';
        }

        // Form submission
        document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to change your password');
                window.location.href = '/login';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            try {
                const response = await fetch('/api/users/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Password changed successfully');
                    window.location.href = '/dashboard';
                } else {
                    alert(data.message || 'Failed to change password');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while changing your password');
            }
        });

        // Real-time password strength checking
        document.getElementById('newPassword').addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });

        // Theme toggle functionality
        document.addEventListener("DOMContentLoaded", function () {
            const themeToggle = document.getElementById("themeToggle");
            if (themeToggle) {
                themeToggle.addEventListener("click", function () {
                    const body = document.body;
                    const isDark = body.getAttribute("data-bs-theme") === "dark";
                    const newTheme = isDark ? "light" : "dark";
                    body.setAttribute("data-bs-theme", newTheme);
                    localStorage.setItem("theme", newTheme);
                    this.innerHTML = isDark
                        ? '<i class="bi bi-sun"></i>'
                        : '<i class="bi bi-moon"></i>';
                });
            }
        });
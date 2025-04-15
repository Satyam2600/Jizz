document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetInstructions = document.getElementById('resetInstructions');
    const rollNoInput = document.getElementById('rollNumber');

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', async () => {
            const rollNo = rollNoInput.value.trim();
            
            if (!rollNo) {
                alert('Please enter your roll number');
                return;
            }

            try {
                // Show loading state
                resetPasswordBtn.disabled = true;
                resetPasswordBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
                
                console.log('Sending password reset request for roll number:', rollNo);
                
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rollNo })
                });

                console.log('Password reset response status:', response.status);
                const data = await response.json();
                console.log('Password reset response data:', data);

                // Hide the form and show the success message
                forgotPasswordForm.classList.add('d-none');
                resetInstructions.classList.remove('d-none');

                // After 5 seconds, redirect to login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            } catch (error) {
                console.error('Error during password reset:', error);
                alert('An error occurred. Please try again later.');
                resetPasswordBtn.disabled = false;
                resetPasswordBtn.innerHTML = 'Reset Password';
            }
        });
    }
}); 
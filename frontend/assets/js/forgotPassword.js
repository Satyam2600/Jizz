document.addEventListener("DOMContentLoaded", () => {
    const resetPasswordBtn = document.getElementById("resetPasswordBtn");
    const rollNoInput = document.getElementById("rollNumber");
  
    if (resetPasswordBtn) {
      resetPasswordBtn.addEventListener("click", async () => {
        const rollNo = rollNoInput.value.trim();
  
        if (!rollNo) {
          alert("Please enter your roll number");
          return;
        }
  
        try {
          resetPasswordBtn.disabled = true;
          resetPasswordBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
  
          console.log("Sending password reset request for roll number:", rollNo);
  
          const response = await fetch("/api/password-reset/request-reset", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid: rollNo }),
          });
  
          const data = await response.json();
  
          if (response.status === 404) {
            alert("No account found with this roll number.");
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.innerHTML = "Reset Password";
            return;
          }
  
          if (!response.ok) {
            throw new Error(data.error || "Failed to process request");
          }
  
          alert("Password reset instructions have been sent to your email.");
          window.location.href = "/login";
        } catch (error) {
          console.error("Error during password reset:", error);
          alert("An error occurred. Please try again later.");
          resetPasswordBtn.disabled = false;
          resetPasswordBtn.innerHTML = "Reset Password";
        }
      });
    }
  });
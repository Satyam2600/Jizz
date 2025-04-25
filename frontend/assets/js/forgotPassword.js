const form = document.getElementById("forgotPasswordForm");
const rollNumberInput = document.getElementById("rollNumber");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rollNumber = rollNumberInput.value.trim();

    if (!rollNumber) {
        messageDiv.textContent = "Please enter your roll number";
        messageDiv.classList.add("error");
        return;
    }

    try {
        messageDiv.textContent = "Processing...";
        console.log("Sending password reset request for roll number:", rollNumber);

        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ rollNumber }),
        });

        const data = await response.json();

        if (response.status === 404) {
            alert("No account found with this roll number.");
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
    }
});
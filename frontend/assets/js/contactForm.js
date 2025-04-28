document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    const responseMessage = document.getElementById("responseMessage");
  
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      // Get form values from inputs by their IDs
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
  
      // Validate inputs
      if (!name || !email || !message) {
        responseMessage.textContent = "Please fill in all required fields.";
        return;
      }

      // Retrieve token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        responseMessage.textContent = "You must be logged in to send a message.";
        return;
      }
  
      try {
        const res = await fetch("http://localhost:5000/api/contact", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ name, email, message }),
        });
  
        const data = await res.json();
        if (res.ok) {
          responseMessage.textContent = data.message || "Message sent successfully!";
          contactForm.reset();
        } else {
          responseMessage.textContent = data.message || "An error occurred. Please try again.";
        }
      } catch (error) {
        console.error("Error during form submission:", error);
        responseMessage.textContent = "Something went wrong! Please check your connection.";
      }
    });
  });

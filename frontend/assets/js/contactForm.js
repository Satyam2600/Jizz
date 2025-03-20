document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector('input[placeholder="Your Name"]').value;
    const email = document.querySelector('input[placeholder="Your Email"]').value;
    const message = document.querySelector('textarea[placeholder="Your Message"]').value;

    try {
        const response = await fetch("http://localhost:5000/api/contact", {  

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Message sent successfully!");
            document.querySelector("form").reset();
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("Something went wrong! Check console for details.");
        console.error(error);
    }
});

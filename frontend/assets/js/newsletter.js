document.getElementById("subscribe-btn").addEventListener("click", async () => {
    const email = document.getElementById("newsletter-email").value.trim();

    if (!email) {
        alert("Please enter your email!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("✅ Subscription successful!");
            document.getElementById("newsletter-email").value = "";
        } else {
            alert("⚠️ " + data.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Something went wrong!");
    }
});
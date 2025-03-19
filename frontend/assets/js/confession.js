document.addEventListener("DOMContentLoaded", async () => {
    const confessionForm = document.getElementById("confessionForm");
    const confessionsContainer = document.getElementById("confessionsContainer");

    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "index.html");

    // Fetch Confessions
    const confessions = await apiRequest("/confessions", "GET", null, token);
    confessions.forEach(confession => {
        const confessionElement = document.createElement("div");
        confessionElement.classList.add("card", "mb-3", "p-3");
        confessionElement.innerHTML = `<p>${confession.content}</p>`;
        confessionsContainer.appendChild(confessionElement);
    });

    // Submit Confession
    if (confessionForm) {
        confessionForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const content = document.getElementById("confessionContent").value;
            await apiRequest("/confessions", "POST", { content }, token);
            location.reload(); // Refresh the page
        });
    }
});

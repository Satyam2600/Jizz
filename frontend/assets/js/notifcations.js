document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "index.html");

    const notificationsContainer = document.getElementById("notificationsContainer");

    const notifications = await apiRequest("/notifications", "GET", null, token);

    notifications.forEach(notification => {
        const notificationElement = document.createElement("div");
        notificationElement.classList.add("alert", "alert-info");
        notificationElement.innerText = notification.message;
        notificationsContainer.appendChild(notificationElement);
    });
});

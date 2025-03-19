document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "index.html"); // Redirect if not logged in

    const postsContainer = document.getElementById("postsContainer");

    const posts = await apiRequest("/posts", "GET", null, token);

    if (posts.error) {
        postsContainer.innerHTML = `<p class="text-danger">${posts.error}</p>`;
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("card", "mb-3", "p-3");
        postElement.innerHTML = `
            <h5>${post.user.name}</h5>
            <p>${post.content}</p>
            <small>${new Date(post.createdAt).toLocaleString()}</small>
        `;
        postsContainer.appendChild(postElement);
    });
});

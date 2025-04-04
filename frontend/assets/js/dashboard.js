// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-bs-theme') === 'dark';
    document.body.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
});

// Mobile Sidebar Toggle
document.querySelector('.navbar-toggler').addEventListener('click', () => {
    document.querySelectorAll('.sidebar').forEach(sidebar => {
        sidebar.classList.toggle('active');
    });
});
document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in. Redirecting to login page.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/get-profile?userId=${userId}`);
      const userProfile = await response.json();

      if (response.ok) {
        document.getElementById("userName").textContent = userProfile.name || "John Doe";
        document.getElementById("userHandle").textContent = userProfile.rollNo ? `@${userProfile.rollNo}` : "@unknown";
        document.getElementById("userAvatar").src = userProfile.avatar || "/assets/images/default-avatar.jpg";
      } else {
        alert("Failed to load user profile.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("An error occurred while loading the profile.");
    }
  });
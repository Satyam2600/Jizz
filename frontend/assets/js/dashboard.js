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
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");
    const userHandle = document.getElementById("userHandle");
  
    // Redirect to login page if user is not logged in
    if (!userId) {
      alert("User not logged in. Redirecting to login page.");
      window.location.href = "/login";
      return;
    }
  
    try {
      // Fetch user profile data from the backend
      const response = await fetch(`http://localhost:5000/api/users/get-profile?userId=${userId}`);
      const userProfile = await response.json();
  
      if (response.ok) {
        // Update the DOM with user data
        userName.textContent = userProfile.fullName || "John Doe"; // Full Name
        userHandle.textContent = userProfile.rollNo ? `@${userProfile.rollNo}` : "@unknown"; // Roll Number
        userAvatar.src = userProfile.avatar || "/assets/images/default-avatar.jpg"; // Profile Photo
      } else {
        console.error("Failed to fetch user profile:", userProfile.message);
        alert("Failed to load user profile. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("An error occurred while loading the profile. Please try again.");
    }
  });

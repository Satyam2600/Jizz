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
    const uid = localStorage.getItem("uid");

    if (!uid) {
        alert("User not logged in. Redirecting to login page.");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/users/get-profile?userId=${uid}`);
        const userProfile = await response.json();

        if (response.ok) {
            // Update user information in the UI
            document.getElementById("userName").textContent = userProfile.name || "Loading...";
            document.getElementById("userHandle").textContent = userProfile.username ? `@${userProfile.username}` : `@${userProfile.rollNo}`;
            
            // Update avatar
            const userAvatar = document.getElementById("userAvatar");
            const dropdownUserAvatar = document.getElementById("dropdownUserAvatar");
            const avatarUrl = userProfile.avatar || "/assets/images/default-avatar.jpg";
            
            userAvatar.src = avatarUrl;
            if (dropdownUserAvatar) {
                dropdownUserAvatar.style.backgroundImage = `url('${avatarUrl}')`;
            }

            // Store user data in localStorage for future use
            localStorage.setItem("userFullName", userProfile.name);
            localStorage.setItem("userUsername", userProfile.username || userProfile.rollNo);
            localStorage.setItem("userProfilePhoto", userProfile.avatar);
            localStorage.setItem("userCoverPhoto", userProfile.banner);
            localStorage.setItem("userDepartment", userProfile.department);
            localStorage.setItem("userBio", userProfile.bio);
            
            // Update other profile information if needed
            if (userProfile.department) {
                document.getElementById("userDepartment")?.textContent = userProfile.department;
            }
            if (userProfile.bio) {
                document.getElementById("userBio")?.textContent = userProfile.bio;
            }
        } else {
            console.error("Failed to load user profile:", userProfile.message);
            // Set default values if profile loading fails
            document.getElementById("userName").textContent = "User";
            document.getElementById("userHandle").textContent = `@${uid}`;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        // Set default values if there's an error
        document.getElementById("userName").textContent = "User";
        document.getElementById("userHandle").textContent = `@${uid}`;
    }
});
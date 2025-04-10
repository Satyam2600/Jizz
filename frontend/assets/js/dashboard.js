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

    // First try to get user details from localStorage (from editProfile page)
    const userFullName = localStorage.getItem("userFullName");
    const userUsername = localStorage.getItem("userUsername");
    const userProfilePhoto = localStorage.getItem("userProfilePhoto");
    const userCoverPhoto = localStorage.getItem("userCoverPhoto");
    const userDepartment = localStorage.getItem("userDepartment");
    const userBio = localStorage.getItem("userBio");

    // If we have user details in localStorage, use them
    if (userFullName) {
      document.getElementById("userName").textContent = userFullName;
    }
    
    if (userUsername) {
      document.getElementById("userHandle").textContent = `@${userUsername}`;
    }
    
    if (userProfilePhoto) {
      document.getElementById("userAvatar").src = userProfilePhoto;
      
      // Also update the dropdown avatar if it exists
      const dropdownUserAvatar = document.getElementById("dropdownUserAvatar");
      if (dropdownUserAvatar) {
        dropdownUserAvatar.style.backgroundImage = `url('${userProfilePhoto}')`;
      }
    }
    
    // If we don't have user details in localStorage, fetch them from the server
    if (!userFullName || !userUsername || !userProfilePhoto) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/get-profile?userId=${uid}`);
        const userProfile = await response.json();

        if (response.ok) {
          // Only update elements if they weren't set from localStorage
          if (!userFullName) {
            document.getElementById("userName").textContent = userProfile.name || "John Doe";
          }
          
          if (!userUsername) {
            document.getElementById("userHandle").textContent = userProfile.rollNo ? `@${userProfile.rollNo}` : "@unknown";
          }
          
          if (!userProfilePhoto) {
            const avatarUrl = userProfile.avatar || "/assets/images/default-avatar.jpg";
            document.getElementById("userAvatar").src = avatarUrl;
            
            // Also update the dropdown avatar if it exists
            const dropdownUserAvatar = document.getElementById("dropdownUserAvatar");
            if (dropdownUserAvatar) {
              dropdownUserAvatar.style.backgroundImage = `url('${avatarUrl}')`;
            }
          }
          
          // Store the fetched data in localStorage for future use
          if (userProfile.name) localStorage.setItem("userFullName", userProfile.name);
          if (userProfile.rollNo) localStorage.setItem("userUsername", userProfile.rollNo);
          if (userProfile.avatar) localStorage.setItem("userProfilePhoto", userProfile.avatar);
          if (userProfile.banner) localStorage.setItem("userCoverPhoto", userProfile.banner);
        } else {
          console.error("Failed to load user profile from server.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
});
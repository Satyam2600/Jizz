// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-bs-theme') === 'dark';
        document.body.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
    });
}

// Mobile Sidebar Toggle
const navbarToggler = document.querySelector('.navbar-toggler');
if (navbarToggler) {
    navbarToggler.addEventListener('click', () => {
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.toggle('active');
        });
    });
}

// Main Dashboard Initialization
document.addEventListener("DOMContentLoaded", async () => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
        alert("User not logged in. Redirecting to login page.");
        window.location.href = "/login";
        return;
    }

    // Set user information from localStorage
    const userFullName = localStorage.getItem('userFullName');
    const userUsername = localStorage.getItem('userUsername');
    const userAvatar = localStorage.getItem('userAvatar');
    const userBanner = localStorage.getItem('userBanner');

    // Update profile elements
    const userNameElement = document.getElementById('userName');
    const userHandleElement = document.getElementById('userHandle');
    const sidebarUserAvatarElement = document.getElementById('sidebarUserAvatar');
    const postUserAvatarElement = document.getElementById('postUserAvatar');
    const bannerImageElement = document.getElementById('bannerImage');
    
    if (userNameElement) userNameElement.textContent = userFullName || 'User';
    if (userHandleElement) userHandleElement.textContent = `@${userUsername || 'username'}`;
    
    // Update all avatar images
    const avatarUrl = userAvatar || '/assets/images/default-avatar.jpg';
    
    if (sidebarUserAvatarElement) {
        sidebarUserAvatarElement.src = avatarUrl;
    }
    
    if (postUserAvatarElement) {
        postUserAvatarElement.src = avatarUrl;
    }

    if (bannerImageElement) {
        bannerImageElement.src = userBanner || '/assets/images/default-banner.jpg';
    }

    try {
        // Fetch user profile from API
        const response = await fetch(`/api/users/get-profile?userId=${uid}`);
        const userProfile = await response.json();

        if (response.ok) {
            // Update user information in the UI
            if (userNameElement) userNameElement.textContent = userProfile.name || "Loading...";
            if (userHandleElement) userHandleElement.textContent = userProfile.username ? `@${userProfile.username}` : `@${userProfile.rollNo}`;
            
            // Update avatar
            const profileAvatarUrl = userProfile.avatar || "/assets/images/default-avatar.jpg";
            
            // Update all avatar images on the page
            const allAvatars = document.querySelectorAll('.user-avatar');
            allAvatars.forEach(avatar => {
                if (avatar.tagName.toLowerCase() === 'img') {
                    avatar.src = profileAvatarUrl;
                } else if (avatar.style) {
                    avatar.style.backgroundImage = `url('${profileAvatarUrl}')`;
                }
            });
            
            // Update dropdown avatar if it exists
            const dropdownUserAvatar = document.getElementById("dropdownUserAvatar");
            if (dropdownUserAvatar) {
                dropdownUserAvatar.style.backgroundImage = `url('${profileAvatarUrl}')`;
            }

            // Store user data in localStorage for future use
            localStorage.setItem("userFullName", userProfile.name);
            localStorage.setItem("userUsername", userProfile.username || userProfile.rollNo);
            localStorage.setItem("userProfilePhoto", userProfile.avatar);
            localStorage.setItem("userCoverPhoto", userProfile.banner);
            localStorage.setItem("userDepartment", userProfile.department);
            localStorage.setItem("userBio", userProfile.bio);
            
            // Update other profile information if needed
            const userDepartmentElement = document.getElementById("userDepartment");
            if (userDepartmentElement) {
                userDepartmentElement.textContent = userProfile.department;
            }
            
            const userBioElement = document.getElementById("userBio");
            if (userBioElement && userProfile.bio) {
                userBioElement.textContent = userProfile.bio;
            }
            
            // Fetch additional user data
            try {
                const additionalResponse = await fetch(`/api/users/profile/${uid}`);
                const userData = await additionalResponse.json();
                
                if (additionalResponse.ok) {
                    // Update additional profile information
                    const userYearElement = document.getElementById('userYear');
                    const skillsListElement = document.getElementById('skillsList');
                    const interestsListElement = document.getElementById('interestsList');
                    
                    if (userYearElement) userYearElement.textContent = `Year ${userData.year || 'Not set'}`;
                    
                    // Update skills and interests
                    if (skillsListElement && userData.skills) {
                        skillsListElement.innerHTML = userData.skills.map(skill => 
                            `<span class="badge bg-primary me-2">${skill}</span>`
                        ).join('');
                    }

                    if (interestsListElement && userData.interests) {
                        interestsListElement.innerHTML = userData.interests.map(interest => 
                            `<span class="badge bg-secondary me-2">${interest}</span>`
                        ).join('');
                    }
                }
            } catch (additionalError) {
                console.error("Error fetching additional user data:", additionalError);
            }
        } else {
            console.error("Failed to load user profile:", userProfile.message);
            // Set default values if profile loading fails
            if (userNameElement) userNameElement.textContent = "User";
            if (userHandleElement) userHandleElement.textContent = `@${uid}`;
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        // Set default values if there's an error
        if (userNameElement) userNameElement.textContent = "User";
        if (userHandleElement) userHandleElement.textContent = `@${uid}`;
    }
});
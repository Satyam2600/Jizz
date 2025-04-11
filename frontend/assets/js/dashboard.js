// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-bs-theme') === 'dark';
        document.body.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
        themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
        emojiPicker.classList.toggle('light', !isDark);
        emojiPicker.classList.toggle('dark', isDark);
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

// Emoji Picker Implementation
const emojiPickerBtn = document.getElementById('emojiPickerBtn');
const emojiPickerDialog = document.getElementById('emojiPickerDialog');
const emojiPicker = document.getElementById('emojiPicker');
const postContent = document.getElementById('postContent');

// Toggle emoji picker
function toggleEmojiPicker() {
    const isVisible = emojiPickerDialog.style.display === 'block';
    if (!isVisible) {
        const buttonRect = emojiPickerBtn.getBoundingClientRect();
        emojiPickerDialog.style.top = `${buttonRect.bottom + window.scrollY + 5}px`;
        emojiPickerDialog.style.left = `${buttonRect.left}px`;
        emojiPickerDialog.style.display = 'block';
    } else {
        emojiPickerDialog.style.display = 'none';
    }
}

// Event Listeners
if (emojiPickerBtn) {
    emojiPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleEmojiPicker();
    });
}

// Handle emoji selection
if (emojiPicker) {
    emojiPicker.addEventListener('emoji-click', event => {
        const cursorPosition = postContent.selectionStart;
        const textBeforeCursor = postContent.value.substring(0, cursorPosition);
        const textAfterCursor = postContent.value.substring(cursorPosition);
        postContent.value = textBeforeCursor + event.detail.unicode + textAfterCursor;
        postContent.focus();
        postContent.selectionStart = cursorPosition + event.detail.unicode.length;
        postContent.selectionEnd = cursorPosition + event.detail.unicode.length;
        emojiPickerDialog.style.display = 'none';
    });
}

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    if (emojiPickerDialog.style.display === 'block' && 
        !emojiPickerDialog.contains(e.target) && 
        !emojiPickerBtn.contains(e.target)) {
        emojiPickerDialog.style.display = 'none';
    }
});

// Handle post submission
const postSubmitBtn = document.getElementById('postSubmitBtn');
if (postSubmitBtn) {
    postSubmitBtn.addEventListener('click', async () => {
        const content = postContent.value.trim();
        const uid = localStorage.getItem('uid');
        
        if (!uid) {
            alert('User not logged in. Please log in again.');
            window.location.href = '/login';
            return;
        }

        if (!content) {
            alert('Please enter some content for your post');
            return;
        }

        try {
            // First, get the user's MongoDB _id
            const userResponse = await fetch(`/api/users/get-profile?userId=${uid}`);
            const userData = await userResponse.json();
            
            if (!userResponse.ok || !userData._id) {
                alert('Failed to get user information. Please try again.');
                return;
            }

            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content,
                    userId: userData._id // Use the MongoDB _id instead of the UID
                }),
            });

            if (response.ok) {
                postContent.value = '';
                // Refresh the feed
                loadPosts();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('An error occurred while creating your post');
        }
    });
}

// Function to load and display posts
async function loadPosts() {
    const postsContainer = document.querySelector('.main-feed');
    if (!postsContainer) return;

    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();

        if (response.ok) {
            // Clear existing posts except the create post card
            const createPostCard = postsContainer.querySelector('.post-card');
            postsContainer.innerHTML = '';
            if (createPostCard) {
                postsContainer.appendChild(createPostCard);
            }

            // Add each post to the feed
            posts.forEach(post => {
                const postElement = createPostElement(post);
                postsContainer.appendChild(postElement);
            });
        } else {
            console.error('Failed to load posts:', posts.message);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Function to create a post element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'card post-card mb-4';
    postDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                    <img src="${post.user.avatar || '/assets/images/default-avatar.jpg'}" 
                         class="user-avatar rounded-circle shadow-sm" 
                         width="48" height="48" 
                         alt="${post.user.name}'s Avatar">
                    <div>
                        <h6 class="mb-0 fw-bold">${post.user.name}</h6>
                        <small class="text-muted">${post.user.department || ''} · ${formatTimeAgo(post.createdAt)}</small>
                    </div>
                </div>
                <div class="dropdown">
                    <button class="btn btn-link text-dark" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#"><i class="bi bi-bookmark me-2"></i>Save Post</a></li>
                        <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-flag me-2"></i>Report Post</a></li>
                    </ul>
                </div>
            </div>
            <p class="mb-3">${post.content}</p>
            ${post.image ? `
                <div class="post-media mb-3 rounded-3 overflow-hidden">
                    <img src="${post.image}" 
                         class="img-fluid w-100" 
                         style="max-height: 480px; object-fit: cover;" 
                         alt="Post Media">
                </div>
            ` : ''}
            ${post.video ? `
                <div class="post-media mb-3 rounded-3 overflow-hidden">
                    <video src="${post.video}" 
                           class="img-fluid w-100" 
                           controls 
                           style="max-height: 480px; object-fit: cover;">
                    </video>
                </div>
            ` : ''}
            <div class="engagement-buttons d-flex gap-3">
                <button class="btn btn-outline-secondary rounded-pill" onclick="handleLike('${post._id}')">
                    <i class="bi bi-heart me-2"></i>${post.likes || 0}
                </button>
                <button class="btn btn-outline-secondary rounded-pill" onclick="handleComment('${post._id}')">
                    <i class="bi bi-chat me-2"></i>${post.comments?.length || 0}
                </button>
                <button class="btn btn-outline-secondary rounded-pill" onclick="handleShare('${post._id}')">
                    <i class="bi bi-share me-2"></i>Share
                </button>
            </div>
            <div class="comment-section mt-3 pt-3">
                <div class="d-flex gap-2 mb-3">
                    <img src="${localStorage.getItem('userAvatar') || '/assets/images/default-avatar.jpg'}" 
                         class="rounded-circle" 
                         width="36" height="36" 
                         alt="Your Avatar">
                    <div class="flex-grow-1">
                        <input type="text" 
                               class="form-control rounded-pill" 
                               placeholder="Write a comment..."
                               onkeypress="handleCommentSubmit(event, '${post._id}')">
                    </div>
                </div>
                <div class="comment-list">
                    ${post.comments?.map(comment => `
                        <div class="d-flex gap-2 mb-3">
                            <img src="${comment.user.avatar || '/assets/images/default-avatar.jpg'}" 
                                 class="rounded-circle" 
                                 width="36" height="36" 
                                 alt="${comment.user.name}'s Avatar">
                            <div class="flex-grow-1">
                                <div class="bg-light rounded-3 p-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <strong>${comment.user.name}</strong>
                                        <small class="text-muted">${formatTimeAgo(comment.createdAt)}</small>
                                    </div>
                                    <p class="mb-0">${comment.content}</p>
                                </div>
                            </div>
                        </div>
                    `).join('') || ''}
                </div>
            </div>
        </div>
    `;
    return postDiv;
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// Load posts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

// Media Upload Implementation
const imageUploadBtn = document.getElementById('imageUploadBtn');
const videoUploadBtn = document.getElementById('videoUploadBtn');

// Create hidden file inputs
const imageInput = document.createElement('input');
imageInput.type = 'file';
imageInput.accept = 'image/*';
imageInput.style.display = 'none';
document.body.appendChild(imageInput);

const videoInput = document.createElement('input');
videoInput.type = 'file';
videoInput.accept = 'video/*';
videoInput.style.display = 'none';
document.body.appendChild(videoInput);

// Handle image upload
if (imageUploadBtn) {
    imageUploadBtn.addEventListener('click', () => {
        imageInput.click();
    });
}

imageInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uid = localStorage.getItem('uid');
    if (!uid) {
        alert('User not logged in. Please log in again.');
        window.location.href = '/login';
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', uid);

    try {
        const response = await fetch('/api/uploads/post-image', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            // Insert image URL into post content
            const imageUrl = data.filePath;
            const cursorPosition = postContent.selectionStart;
            const textBeforeCursor = postContent.value.substring(0, cursorPosition);
            const textAfterCursor = postContent.value.substring(cursorPosition);
            postContent.value = textBeforeCursor + `\n[Image](${imageUrl})\n` + textAfterCursor;
            postContent.focus();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image');
    }
});

// Handle video upload
if (videoUploadBtn) {
    videoUploadBtn.addEventListener('click', () => {
        videoInput.click();
    });
}

videoInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uid = localStorage.getItem('uid');
    if (!uid) {
        alert('User not logged in. Please log in again.');
        window.location.href = '/login';
        return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', uid);

    try {
        const response = await fetch('/api/uploads/post-video', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            // Insert video URL into post content
            const videoUrl = data.filePath;
            const cursorPosition = postContent.selectionStart;
            const textBeforeCursor = postContent.value.substring(0, cursorPosition);
            const textAfterCursor = postContent.value.substring(cursorPosition);
            postContent.value = textBeforeCursor + `\n[Video](${videoUrl})\n` + textAfterCursor;
            postContent.focus();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to upload video');
        }
    } catch (error) {
        console.error('Error uploading video:', error);
        alert('An error occurred while uploading the video');
    }
});
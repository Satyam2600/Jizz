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
    console.log("Dashboard initialization started");
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("No token found, redirecting to login");
        window.location.href = "/login";
        return;
    }
    
    // Get user info from localStorage
    const userFullName = localStorage.getItem("userFullName");
    const userUsername = localStorage.getItem("userUsername");
    const userProfilePhoto = localStorage.getItem("userProfilePhoto");
    
    console.log("User data from localStorage:", {
        fullName: userFullName,
        username: userUsername,
        profilePhoto: userProfilePhoto
    });
    
    // Update sidebar user info
    const sidebarUserAvatar = document.getElementById("sidebarUserAvatar");
    const userName = document.getElementById("userName");
    const userHandle = document.getElementById("userHandle");
    
    // Set user avatar in sidebar
    if (sidebarUserAvatar) {
        if (userProfilePhoto && userProfilePhoto !== 'undefined' && userProfilePhoto !== 'null') {
            sidebarUserAvatar.src = userProfilePhoto;
            console.log('Setting sidebar avatar to:', userProfilePhoto);
        } else {
            sidebarUserAvatar.src = '/assets/images/default-avatar.png';
            console.log('Setting sidebar avatar to default');
        }
        sidebarUserAvatar.alt = userFullName || 'User Avatar';
    }
    
    // Set user name in sidebar
    if (userName) {
        userName.textContent = userFullName || 'User';
        console.log('Setting user name to:', userFullName || 'User');
    }
    
    // Set username/handle in sidebar
    if (userHandle) {
        userHandle.textContent = userUsername ? `@${userUsername}` : '@user';
        console.log('Setting user handle to:', userUsername ? `@${userUsername}` : '@user');
    }
    
    // Update post creation area
    const postUserAvatar = document.getElementById("postUserAvatar");
    const postUserName = document.getElementById("postUserName");
    const postUserHandle = document.getElementById("postUserHandle");
    
    // Set user avatar in post creation area
    if (postUserAvatar) {
        if (userProfilePhoto && userProfilePhoto !== 'undefined' && userProfilePhoto !== 'null') {
            postUserAvatar.src = userProfilePhoto;
            console.log('Setting post avatar to:', userProfilePhoto);
        } else {
            postUserAvatar.src = '/assets/images/default-avatar.png';
            console.log('Setting post avatar to default');
        }
        postUserAvatar.alt = userFullName || 'User Avatar';
    }
    
    // Set user name in post creation area
    if (postUserName) {
        postUserName.textContent = userFullName || 'User';
        console.log('Setting post user name to:', userFullName || 'User');
    }
    
    // Set username/handle in post creation area
    if (postUserHandle) {
        postUserHandle.textContent = userUsername ? `@${userUsername}` : '@user';
        console.log('Setting post user handle to:', userUsername ? `@${userUsername}` : '@user');
    }
    
    // If we don't have user data in localStorage, fetch it from the server
    if (!userFullName || !userUsername || !userProfilePhoto) {
        try {
            const response = await fetch('/api/users/my-profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched user data from server:', data);
                
                // Update localStorage with fetched data
                localStorage.setItem('userFullName', data.fullName || '');
                localStorage.setItem('userUsername', data.username || '');
                localStorage.setItem('userProfilePhoto', data.avatar || '/assets/images/default-avatar.png');
                
                // Update UI with fetched data
                if (userName) userName.textContent = data.fullName || 'User';
                if (userHandle) userHandle.textContent = data.username ? `@${data.username}` : '@user';
                if (sidebarUserAvatar) sidebarUserAvatar.src = data.avatar || '/assets/images/default-avatar.png';
                if (postUserName) postUserName.textContent = data.fullName || 'User';
                if (postUserHandle) postUserHandle.textContent = data.username ? `@${data.username}` : '@user';
                if (postUserAvatar) postUserAvatar.src = data.avatar || '/assets/images/default-avatar.png';
            } else {
                console.error('Failed to fetch user data:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    
    // Initialize emoji picker
    const emojiPicker = new EmojiMart.Picker({
        onEmojiSelect: (emoji) => {
            const postInput = document.querySelector(".post-input");
            if (postInput) {
                postInput.value += emoji.native;
            }
        },
    });
    
    // Load posts
    await loadPosts();
});

// Emoji Picker Implementation
let emojiPicker = null;
const emojiPickerContainer = document.getElementById('emoji-picker-container');
const emojiPickerBtn = document.getElementById('emojiPickerBtn');
const postContent = document.getElementById('postContent');

// Initialize emoji picker
function initializeEmojiPicker() {
    const emojiPickerBtn = document.getElementById('emojiPickerBtn');
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const postContent = document.getElementById('postContent');
    
    if (!emojiPickerBtn || !emojiPickerContainer || !postContent) {
        console.error('Emoji picker elements not found');
        return;
    }
    
    // Toggle emoji picker visibility
    emojiPickerBtn.addEventListener('click', () => {
        const isVisible = emojiPickerContainer.style.display === 'block';
        emojiPickerContainer.style.display = isVisible ? 'none' : 'block';
        
        // Position the emoji picker near the button
        if (!isVisible) {
            const buttonRect = emojiPickerBtn.getBoundingClientRect();
            emojiPickerContainer.style.top = `${buttonRect.bottom + 10}px`;
            emojiPickerContainer.style.left = `${buttonRect.left}px`;
        }
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPickerContainer.contains(e.target) && e.target !== emojiPickerBtn) {
            emojiPickerContainer.style.display = 'none';
        }
    });
    
    // Insert emoji at cursor position
    function insertEmoji(emoji) {
        const cursorPos = postContent.selectionStart;
        const text = postContent.value;
        postContent.value = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
        postContent.focus();
        postContent.selectionStart = cursorPos + emoji.length;
        postContent.selectionEnd = cursorPos + emoji.length;
        
        // Hide emoji picker after insertion
        emojiPickerContainer.style.display = 'none';
    }
    
    // Add click event to emoji buttons
    const emojiButtons = emojiPickerContainer.querySelectorAll('.emoji-button');
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            insertEmoji(button.textContent);
        });
    });
}

// Create a simple fallback emoji picker
function createFallbackEmojiPicker() {
    // Common emojis to display
    const commonEmojis = [
        '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
        '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
        '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
        '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶',
        '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴',
        '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👏', '🙌', '👋', '🤝', '✌️', '🤞',
        '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '👆', '🖕', '👇', '✋', '🤚', '🖐️', '🖖', '👋'
    ];
    
    // Create emoji grid
    const emojiGrid = document.createElement('div');
    emojiGrid.className = 'emoji-grid';
    
    // Add emojis to grid
    commonEmojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'emoji-button';
        emojiButton.textContent = emoji;
        
        // Add click handler
        emojiButton.addEventListener('click', () => {
            insertEmoji(emoji);
        });
        
        emojiGrid.appendChild(emojiButton);
    });
    
    // Add to container
    emojiPickerContainer.innerHTML = '';
    emojiPickerContainer.appendChild(emojiGrid);
}

// Toggle emoji picker visibility
function toggleEmojiPicker() {
    if (!emojiPickerContainer) return;
    
    const isVisible = emojiPickerContainer.style.display === 'block';
    
    if (isVisible) {
        emojiPickerContainer.style.display = 'none';
    } else {
        // Position the emoji picker near the button
        const buttonRect = emojiPickerBtn.getBoundingClientRect();
        
        // Calculate position to ensure it stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position horizontally - try to align with the button
        let leftPosition = buttonRect.left;
        
        // If the picker would go off the right edge, adjust it
        if (leftPosition + 320 > viewportWidth) {
            leftPosition = viewportWidth - 320 - 10; // 320px width + 10px margin
        }
        
        // Position vertically - try to place below the button
        let topPosition = buttonRect.bottom + 10;
        
        // If the picker would go off the bottom, place it above the button
        if (topPosition + 350 > viewportHeight) {
            topPosition = buttonRect.top - 350 - 10; // 350px height + 10px margin
        }
        
        emojiPickerContainer.style.top = `${topPosition}px`;
        emojiPickerContainer.style.left = `${leftPosition}px`;
        emojiPickerContainer.style.display = 'block';
        
        // Update theme if needed
        if (emojiPicker && typeof emojiPicker.updateTheme === 'function') {
            emojiPicker.updateTheme(document.body.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');
        }
    }
}

// Insert emoji at cursor position
function insertEmoji(emoji) {
    if (!postContent) return;
    
    const cursorPos = postContent.selectionStart;
    const text = postContent.value;
    postContent.value = text.slice(0, cursorPos) + emoji + text.slice(cursorPos);
    postContent.focus();
    postContent.selectionStart = cursorPos + emoji.length;
    postContent.selectionEnd = cursorPos + emoji.length;
    
    // Hide emoji picker after insertion
    emojiPickerContainer.style.display = 'none';
}

// Handle post submission
const createPostForm = document.getElementById('createPostForm');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = postContent.value.trim();
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Authentication token missing. Please log in again.');
            window.location.href = '/login';
            return;
        }

        if (!content) {
            alert('Please enter some content for your post');
            return;
        }

        try {
            // Create form data with content
            const formData = new FormData();
            formData.append('content', content);

            // Add media if present
            const imageInput = document.getElementById('imageUpload');
            const videoInput = document.getElementById('videoUpload');
            
            if (imageInput && imageInput.files[0]) {
                formData.append('media', imageInput.files[0]);
            } else if (videoInput && videoInput.files[0]) {
                formData.append('media', videoInput.files[0]);
            }

            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message === 'Invalid Token') {
                    localStorage.removeItem('token'); // Clear the invalid token
                    alert('Your session has expired. Please log in again.');
                    window.location.href = '/login';
                    return;
                }
                alert(errorData.message || 'Failed to create post');
                return;
            }

            postContent.value = '';
            // Clear file inputs
            if (imageInput) imageInput.value = '';
            if (videoInput) videoInput.value = '';
            // Refresh the feed
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('An error occurred while creating your post');
        }
    });
}

// Function to load and display posts
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('Authentication token missing');
        postsContainer.innerHTML = '<div class="alert alert-danger">Authentication error. Please log in again.</div>';
        return;
    }

    try {
        const response = await fetch('/api/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to load posts:', errorData.message);
            
            if (errorData.message === 'Invalid Token') {
                // Token is invalid, redirect to login
                localStorage.removeItem('token'); // Clear the invalid token
                postsContainer.innerHTML = '<div class="alert alert-danger">Your session has expired. Please log in again.</div>';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }
            
            postsContainer.innerHTML = '<div class="alert alert-danger">Failed to load posts. Please try again later.</div>';
            return;
        }
        
        const posts = await response.json();

        // Clear existing posts
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="alert alert-info">No posts yet. Be the first to post!</div>';
            return;
        }

        // Add each post to the feed
        posts.forEach(post => {
            const postElement = createPostCard(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<div class="alert alert-danger">An error occurred while loading posts.</div>';
    }
}

// Function to create a post card
function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.dataset.postId = post._id;
    
    // Format date
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    
    // Create post header
    const postHeader = document.createElement("div");
    postHeader.className = "post-header";
    
    const postAvatar = document.createElement("img");
    postAvatar.className = "post-avatar";
    
    // Set profile photo with proper validation
    if (post.user && post.user.avatar && post.user.avatar !== "undefined" && post.user.avatar !== "null") {
        postAvatar.src = post.user.avatar;
    } else {
        postAvatar.src = "/assets/images/default-avatar.jpg";
    }
    
    postAvatar.alt = post.user.name || "User";
    
    const postUserInfo = document.createElement("div");
    
    const postUserName = document.createElement("h6");
    postUserName.className = "mb-0 fw-bold";
    postUserName.textContent = post.user.name || "User";
    
    const postUserHandle = document.createElement("small");
    postUserHandle.className = "text-muted";
    postUserHandle.textContent = `@${post.user.username || "user"}`;
    
    const postTime = document.createElement("small");
    postTime.className = "text-muted ms-2";
    postTime.textContent = formattedDate;
    
    postUserInfo.appendChild(postUserName);
    postUserInfo.appendChild(postUserHandle);
    postUserInfo.appendChild(postTime);
    
    postHeader.appendChild(postAvatar);
    postHeader.appendChild(postUserInfo);
    
    // Create post content
    const postContent = document.createElement("div");
    postContent.className = "post-content";
    
    const postText = document.createElement("p");
    postText.className = "mb-3";
    postText.textContent = post.content;
    
    postContent.appendChild(postText);
    
    // Add media if exists
    if (post.media) {
        const postMedia = document.createElement("img");
        postMedia.className = "post-media";
        postMedia.src = post.media;
        postMedia.alt = "Post media";
        postContent.appendChild(postMedia);
    }
    
    // Create post actions
    const postActions = document.createElement("div");
    postActions.className = "post-actions";
    
    const likeButton = document.createElement("button");
    likeButton.className = "post-action-btn";
    if (post.liked) {
        likeButton.classList.add("liked");
    }
    likeButton.innerHTML = `<i class="bi bi-heart${post.liked ? "-fill" : ""}"></i> <span>${post.likes || 0}</span>`;
    likeButton.addEventListener("click", () => toggleLike(post._id));
    
    const commentButton = document.createElement("button");
    commentButton.className = "post-action-btn";
    commentButton.innerHTML = `<i class="bi bi-chat"></i> <span>${post.comments ? post.comments.length : 0}</span>`;
    commentButton.addEventListener("click", () => toggleComments(post._id));
    
    const shareButton = document.createElement("button");
    shareButton.className = "post-action-btn";
    shareButton.innerHTML = `<i class="bi bi-share"></i>`;
    shareButton.addEventListener("click", () => sharePost(post._id));
    
    postActions.appendChild(likeButton);
    postActions.appendChild(commentButton);
    postActions.appendChild(shareButton);
    
    // Create comments section
    const postComments = document.createElement("div");
    postComments.className = "post-comments";
    postComments.style.display = "none";
    
    // Add existing comments
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            const commentItem = document.createElement("div");
            commentItem.className = "comment-item";
            
            const commentAvatar = document.createElement("img");
            commentAvatar.className = "comment-avatar";
            
            // Set comment avatar with proper validation
            if (comment.user && comment.user.avatar && comment.user.avatar !== "undefined" && comment.user.avatar !== "null") {
                commentAvatar.src = comment.user.avatar;
            } else {
                commentAvatar.src = "/assets/images/default-avatar.jpg";
            }
            
            commentAvatar.alt = comment.user.name || "User";
            
            const commentContent = document.createElement("div");
            commentContent.className = "comment-content";
            
            const commentUserName = document.createElement("strong");
            commentUserName.textContent = comment.user.name;
            
            const commentText = document.createElement("p");
            commentText.className = "mb-0";
            commentText.textContent = comment.content;
            
            commentContent.appendChild(commentUserName);
            commentContent.appendChild(commentText);
            
            commentItem.appendChild(commentAvatar);
            commentItem.appendChild(commentContent);
            
            postComments.appendChild(commentItem);
        });
    }
    
    // Add comment input
    const commentInput = document.createElement("div");
    commentInput.className = "comment-input";
    
    const commentInputField = document.createElement("input");
    commentInputField.className = "comment-input-field";
    commentInputField.placeholder = "Write a comment...";
    
    const commentSubmitBtn = document.createElement("button");
    commentSubmitBtn.className = "comment-submit-btn";
    commentSubmitBtn.innerHTML = `<i class="bi bi-send"></i>`;
    commentSubmitBtn.addEventListener("click", () => {
        if (commentInputField.value.trim()) {
            addComment(post._id, commentInputField.value);
            commentInputField.value = "";
        }
    });
    
    commentInput.appendChild(commentInputField);
    commentInput.appendChild(commentSubmitBtn);
    
    postComments.appendChild(commentInput);
    
    // Assemble post card
    postCard.appendChild(postHeader);
    postCard.appendChild(postContent);
    postCard.appendChild(postActions);
    postCard.appendChild(postComments);
    
    return postCard;
}

// Function to toggle comments visibility
function toggleComments(postId) {
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (!postCard) return;
    
    const commentsSection = postCard.querySelector(".post-comments");
    if (commentsSection.style.display === "none") {
        commentsSection.style.display = "block";
    } else {
        commentsSection.style.display = "none";
    }
}

// Handle like functionality
async function handleLike(postId) {
    const uid = localStorage.getItem('uid');
    if (!uid) {
        alert('Please log in to like posts');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Update the like count in the UI
            const likeButton = document.querySelector(`#post-${postId} .engagement-buttons button:first-child`);
            if (likeButton) {
                likeButton.innerHTML = `<i class="bi bi-heart${data.isLiked ? '-fill text-danger' : ''} me-2"></i>${data.likes}`;
            }
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to like post');
        }
    } catch (error) {
        console.error('Error liking post:', error);
        alert('An error occurred while liking the post');
    }
}

// Handle comment submission
async function handleCommentSubmit(event, postId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        const commentInput = document.getElementById(`comment-input-${postId}`);
        const content = commentInput.value.trim();
        
        if (!content) return;
        
        const uid = localStorage.getItem('uid');
        if (!uid) {
            alert('Please log in to comment');
            window.location.href = '/login';
            return;
        }
        
        try {
            // Get user's MongoDB _id
            const userResponse = await fetch(`/api/users/get-profile?userId=${uid}`);
            const userData = await userResponse.json();
            
            if (!userResponse.ok || !userData._id) {
                alert('Failed to get user information. Please try again.');
                return;
            }
            
            const response = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    userId: userData._id
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Clear the input
                commentInput.value = '';
                
                // Add the new comment to the UI
                const commentList = document.getElementById(`comment-list-${postId}`);
                if (commentList) {
                    const currentUserAvatar = localStorage.getItem('userAvatar') || '/assets/images/default-avatar.jpg';
                    const currentUserName = localStorage.getItem('userFullName') || 'You';
                    
                    const commentElement = document.createElement('div');
                    commentElement.className = 'd-flex gap-2 mb-3';
                    commentElement.innerHTML = `
                        <img src="${currentUserAvatar}" 
                             class="rounded-circle" 
                             width="36" height="36" 
                             alt="Your Avatar">
                        <div class="flex-grow-1">
                            <div class="bg-light rounded-3 p-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>${currentUserName}</strong>
                                    <small class="text-muted">just now</small>
                                </div>
                                <p class="mb-0">${content}</p>
                            </div>
                        </div>
                    `;
                    
                    // Remove "No comments yet" message if it exists
                    const noCommentsMsg = commentList.querySelector('p.text-muted');
                    if (noCommentsMsg) {
                        commentList.removeChild(noCommentsMsg);
                    }
                    
                    commentList.appendChild(commentElement);
                    
                    // Update comment count
                    const commentButton = document.querySelector(`#post-${postId} .engagement-buttons button:nth-child(2)`);
                    if (commentButton) {
                        const currentCount = parseInt(commentButton.textContent.match(/\d+/)[0] || '0');
                        commentButton.innerHTML = `<i class="bi bi-chat me-2"></i>${currentCount + 1}`;
                    }
                }
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('An error occurred while adding your comment');
        }
    }
}

// Handle share functionality
function handleShare(postId) {
    // Get the current URL
    const url = window.location.origin + '/post/' + postId;
    
    // Check if the browser supports the clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Post link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy link to clipboard');
        });
    } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Post link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy link to clipboard');
        }
        document.body.removeChild(textArea);
    }
}

// Save post functionality
function savePost(postId) {
    // This would typically save the post to the user's saved posts
    alert('Post saved!');
}

// Report post functionality
async function reportPost(postId) {
    const reason = prompt('Please enter the reason for reporting this post:');
    if (reason) {
        try {
            const response = await fetch(`/api/posts/${postId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                alert('Post reported. Thank you for your feedback.');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to report post');
            }
        } catch (error) {
            console.error('Error reporting post:', error);
            alert('An error occurred while reporting the post');
        }
    }
}

// Handle image upload
const imageUploadBtn = document.getElementById('imageUploadBtn');
const imageInput = document.getElementById('imageUpload');

if (imageUploadBtn) {
    imageUploadBtn.addEventListener('click', () => {
        imageInput.click();
    });
}

if (imageInput) {
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
}

// Handle video upload
const videoUploadBtn = document.getElementById('videoUploadBtn');
const videoInput = document.getElementById('videoUpload');
        
if (videoUploadBtn) {
    videoUploadBtn.addEventListener('click', () => {
        videoInput.click();
    });
}

if (videoInput) {
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
}
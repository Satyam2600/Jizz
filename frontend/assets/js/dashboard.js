// Import EmojiMart components and data

// Get DOM elements
const imageInput = document.getElementById('imageUpload');
const videoInput = document.getElementById('videoUpload');
const imageUploadBtn = document.getElementById('imageUploadBtn');
const videoUploadBtn = document.getElementById('videoUploadBtn');
// Ensure postContent is correctly linked to the input field
const postContent = document.getElementById('postContent');

if (!postContent) {
    console.error('Post content input field not found. Ensure the input field has the correct ID.');
}

// Media preview container
let currentMediaFile = null;
let currentMediaType = null;

// Render a post card
function renderPost(post) {
    console.log('Rendering post:', post); // Debug log
    
    // Use post.user for user details
    const user = post.user || {};
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isCurrentUser = user._id === currentUser._id;
    const isFollowing = user.isFollowing || false; // Should be provided by backend for each post's user
    const followersCount = user.followersCount || 0;
    // Likes/comments
    const isLiked = Array.isArray(post.likedBy) && post.likedBy.includes(localStorage.getItem('userId'));
    const likeCount = post.likes || (post.likedBy ? post.likedBy.length : 0);
    const comments = post.comments || [];
    
    // Fix avatar path handling
    const userAvatar = user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null' 
        ? (user.avatar.startsWith('/') || user.avatar.startsWith('http') ? user.avatar : `/uploads/${user.avatar}`) 
        : '/assets/images/default-avatar.png';
    let mediaHtml = '';
    if (post.image) {
        console.log('Rendering image:', post.image); // Debug log
        // Fix image path handling
        const imagePath = post.image.startsWith('/') || post.image.startsWith('http') 
            ? post.image 
            : `/uploads/${post.image}`;
        mediaHtml = `
            <div class="post-media mb-3">
                <img src="${imagePath}" 
                     class="img-fluid w-100 rounded" 
                     alt="Post Image"
                     style="max-height: 400px; object-fit: cover;">
            </div>
        `;
    } else if (post.video) {
        console.log('Rendering video:', post.video); // Debug log
        // Fix video path handling
        const videoPath = post.video.startsWith('/') || post.video.startsWith('http') 
            ? post.video 
            : `/uploads/${post.video}`;
        mediaHtml = `
            <div class="post-media mb-3">
                <video class="w-100 rounded" 
                       style="max-height: 400px;"
                       controls
                       autoplay
                       muted
                       loop
                       playsinline>
                    <source src="${videoPath}" type="video/mp4">
                    <source src="${videoPath}" type="video/webm">
                    <source src="${videoPath}" type="video/quicktime">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }

    return `
        <div class="card mb-4 post-card" data-post-id="${post._id}">
            <div class="card-body p-4">
                <!-- Post Header -->
                <div class="d-flex align-items-center mb-3">
                    <img src="${userAvatar}" 
                         alt="Avatar" 
                         class="rounded-circle me-3" 
                         style="width: 48px; height: 48px; object-fit: cover;">
                    <div>
                        <h6 class="mb-0 fw-bold">${user.fullName || 'Unknown User'}</h6>
                        <small class="text-muted">
                            @${user.username || user.rollNumber || 'unknown'} • 
                            <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
                        </small>
                    </div>
                    ${!isCurrentUser ? `<button class="btn btn-sm ms-3 btn-follow-user ${isFollowing ? 'btn-success' : 'btn-outline-primary'}" 
                        data-user-id="${user._id}" 
                        data-following="${isFollowing}">
                        <span class="follow-btn-text">${isFollowing ? 'Following' : 'Follow'}</span>
                    </button>` : ''}
                </div>

                <!-- Post Content -->
                <div class="post-content mb-3">
                    ${post.content}
                </div>

                <!-- Post Media -->
                ${mediaHtml}

                <!-- Post Actions -->
                <div class="d-flex gap-3 align-items-center mt-3 pt-3 border-top">
                    <button class="btn btn-like ${isLiked ? 'btn-primary' : 'btn-outline-primary'}" 
                            data-post-id="${post._id}">
                        <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1"></i>
                        <span class="like-count">${likeCount}</span>
                    </button>
                    
                    <button class="btn btn-outline-secondary btn-comment" 
                            data-post-id="${post._id}">
                        <i class="bi bi-chat me-1"></i>
                        <span class="comment-count">${comments.length}</span>
                    </button>
                    
                    <button class="btn btn-outline-secondary btn-share" 
                            data-post-id="${post._id}">
                        <i class="bi bi-share me-1"></i>
                        Share
                    </button>
                </div>

                <!-- Comments Section -->
                <div class="comments-section mt-3" style="display: none;">
                    ${comments.map(comment => {
                        // Fix comment avatar handling
                        const commentUserAvatar = comment.user?.avatar && 
                            comment.user.avatar !== 'undefined' && 
                            comment.user.avatar !== 'null'
                            ? (comment.user.avatar.startsWith('/') || comment.user.avatar.startsWith('http') 
                               ? comment.user.avatar 
                               : `/uploads/${comment.user.avatar}`)
                            : '/assets/images/default-avatar.png';
                        
                        return `
                        <div class="d-flex align-items-start mb-3">
                            <img src="${commentUserAvatar}" 
                                 alt="Avatar" 
                                 class="rounded-circle me-2" 
                                 style="width: 32px; height: 32px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <div class="bg-light rounded-3 p-3">
                                    <div class="d-flex justify-content-between mb-1">
                                        <strong class="small">${comment.user?.fullName || 'Unknown'}</strong>
                                        <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
                                    </div>
                                    <p class="mb-0">${comment.content}</p>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                    
                    <form class="add-comment-form mt-3" data-post-id="${post._id}">
                        <div class="input-group">
                            <input type="text" 
                                   class="form-control comment-input" 
                                   placeholder="Write a comment..." 
                                   style="border-radius: 20px 0 0 20px;">
                            <button type="submit" 
                                    class="btn btn-success" 
                                    style="border-radius: 0 20px 20px 0;">
                                <i class="bi bi-send"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

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

// Helper: Fetch comments for a post
async function fetchCommentsForPost(postId) {
    try {
        const response = await fetch(`/api/comments/post/${postId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        return [];
    }
}

// Modified loadPosts to fetch comments for each post
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<div class="text-center py-4">Loading posts...</div>';
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            postsContainer.innerHTML = '<div class="text-center py-5 text-danger">You are not logged in. Please log in to view posts.</div>';
            return;
        }

        const response = await fetch('/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            postsContainer.innerHTML = `<div class="text-center py-5 text-danger">${errorData.message || 'Failed to load posts.'}</div>`;
            return;
        }

        const data = await response.json();
        postsContainer.innerHTML = '';

        if (data.success && data.posts && data.posts.length > 0) {
            // Fetch comments for each post in parallel
            const postsWithComments = await Promise.all(
                data.posts.map(async post => {
                    const comments = await fetchCommentsForPost(post._id);
                    return { ...post, comments };
                })
            );
            postsWithComments.forEach(post => {
                postsContainer.innerHTML += renderPost(post);
            });
            attachPostEventListeners();
        } else {
            postsContainer.innerHTML = `<div class="text-center py-5 text-muted">${data.message || 'No posts available. Be the first to post!'}</div>`;
        }
    } catch (err) {
        postsContainer.innerHTML = '<div class="text-center py-5 text-danger">Failed to load posts. Please try again later.</div>';
        console.error('Error loading posts:', err);
    }
}

// Attach like and comment event listeners
function attachPostEventListeners() {
    // Like functionality
    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.onclick = async function(e) {
            e.preventDefault();
            const postId = btn.getAttribute('data-post-id');
            const token = localStorage.getItem('token');
            
            if (!token) {
                alert('Please log in to like posts');
                window.location.href = '/login';
                return;
            }

            try {
                const response = await fetch(`/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Update the like button state
                    const likeCount = btn.querySelector('.like-count');
                    if (likeCount) {
                        likeCount.textContent = data.likes;
                    }
                    
                    // Toggle button classes
                    if (data.isLiked) {
                        btn.classList.remove('btn-outline-primary');
                        btn.classList.add('btn-primary');
                        btn.querySelector('i').classList.remove('bi-heart');
                        btn.querySelector('i').classList.add('bi-heart-fill');
                    } else {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline-primary');
                        btn.querySelector('i').classList.remove('bi-heart-fill');
                        btn.querySelector('i').classList.add('bi-heart');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Failed to like post');
                }
            } catch (err) {
                console.error('Error liking post:', err);
                alert('Failed to like post');
            }
        };
    });

    // Comment functionality
    document.querySelectorAll('.btn-comment').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            const postId = btn.getAttribute('data-post-id');
            const commentsSection = document.querySelector(`.post-card[data-post-id="${postId}"] .comments-section`);
            
            if (commentsSection) {
                const isVisible = commentsSection.style.display === 'block';
                commentsSection.style.display = isVisible ? 'none' : 'block';
                
                if (!isVisible) {
                    // Focus the comment input when opening comments
                    const commentInput = commentsSection.querySelector('.comment-input');
                    if (commentInput) {
                        commentInput.focus();
                    }
                }
            }
        };
    });

    // Comment submission
    document.querySelectorAll('.add-comment-form').forEach(form => {
        form.onsubmit = async function(e) {
            e.preventDefault();
            const postId = form.getAttribute('data-post-id');
            const input = form.querySelector('.comment-input');
            const content = input.value.trim();
            
            if (!content) return;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to comment');
                window.location.href = '/login';
                return;
            }

            try {
                const response = await fetch(`/api/comments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        content,
                        postId
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Clear the input
                    input.value = '';
                    
                    // Update comment count
                    const commentBtn = document.querySelector(`.btn-comment[data-post-id="${postId}"] .comment-count`);
                    if (commentBtn) {
                        commentBtn.textContent = parseInt(commentBtn.textContent) + 1;
                    }
                    
                    // Add the new comment to the UI
                    const commentsSection = form.parentElement;
                    const newComment = document.createElement('div');
                    newComment.className = 'd-flex align-items-start mb-3';
                    
                    // Get current user info from localStorage
                    const userFullName = localStorage.getItem('userFullName');
                    const userAvatar = localStorage.getItem('userProfilePhoto') || '/assets/images/default-avatar.png';
                    
                    newComment.innerHTML = `
                        <img src="${userAvatar}" 
                             alt="Avatar" 
                             class="rounded-circle me-2" 
                             style="width: 32px; height: 32px; object-fit: cover;">
                        <div class="flex-grow-1">
                            <div class="bg-light rounded-3 p-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <strong class="small">${userFullName}</strong>
                                    <small class="text-muted">just now</small>
                                </div>
                                <p class="mb-0">${content}</p>
                            </div>
                        </div>
                    `;
                    
                    // Insert the new comment before the comment form
                    commentsSection.insertBefore(newComment, form);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Failed to add comment');
                }
            } catch (err) {
                console.error('Error adding comment:', err);
                alert('Failed to add comment');
            }
        };
    });

    // Share functionality
    document.querySelectorAll('.btn-share').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            const postId = btn.getAttribute('data-post-id');
            const url = `${window.location.origin}/post/${postId}`;
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(() => {
                    alert('Post link copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy:', err);
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
                    console.error('Failed to copy:', err);
                    alert('Failed to copy link to clipboard');
                }
                document.body.removeChild(textArea);
            }
        };
    });

    // Follow/Unfollow functionality
    document.querySelectorAll('.btn-follow-user').forEach(btn => {
        btn.onclick = async function(e) {
            e.preventDefault();
            const userId = btn.getAttribute('data-user-id');
            let isFollowing = btn.getAttribute('data-following') === 'true';
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to follow users');
                window.location.href = '/login';
                return;
            }
            try {
                const endpoint = isFollowing ? `/api/users/${userId}/unfollow` : `/api/users/${userId}/follow`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Toggle follow state
                    isFollowing = !isFollowing;
                    btn.setAttribute('data-following', isFollowing.toString());
                    if (isFollowing) {
                        btn.classList.remove('btn-outline-primary');
                        btn.classList.add('btn-success');
                        btn.querySelector('.follow-btn-text').textContent = 'Following';
                    } else {
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-outline-primary');
                        btn.querySelector('.follow-btn-text').textContent = 'Follow';
                    }
                    // Update follower count in the UI if present
                    const postCard = btn.closest('.post-card');
                    if (postCard) {
                        const userId = btn.getAttribute('data-user-id');
                        // Find all follow buttons for this user and update their state
                        document.querySelectorAll(`.btn-follow-user[data-user-id="${userId}"]`).forEach(otherBtn => {
                            otherBtn.setAttribute('data-following', isFollowing.toString());
                            if (isFollowing) {
                                otherBtn.classList.remove('btn-outline-primary');
                                otherBtn.classList.add('btn-success');
                                otherBtn.querySelector('.follow-btn-text').textContent = 'Following';
                            } else {
                                otherBtn.classList.remove('btn-success');
                                otherBtn.classList.add('btn-outline-primary');
                                otherBtn.querySelector('.follow-btn-text').textContent = 'Follow';
                            }
                        });
                    }
                    // Update follower count in profile page if open
                    const followersCountElem = document.querySelector('.stat-title')?.textContent?.trim() === 'Followers'
                        ? document.querySelector('.stat-title').previousElementSibling
                        : null;
                    if (followersCountElem && data.followersCount !== undefined) {
                        followersCountElem.textContent = data.followersCount;
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Failed to update follow status');
                }
            } catch (err) {
                alert('Failed to update follow status');
            }
        };
    });
}

// Main Dashboard Initialization
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Dashboard initialization started");
    
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    let userData = null;
    if (storedUser) {
        try {
            userData = JSON.parse(storedUser);
            console.log('Retrieved user data:', userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    const userFullName = userData?.fullName || null;
    const userUsername = userData?.username || null;
    const userProfilePhoto = userData?.avatar || null;
    
    // Update sidebar user info
    const sidebarUserAvatar = document.getElementById("sidebarUserAvatar");
    const userName = document.getElementById("userName");
    const userHandle = document.getElementById("userHandle");
    
    if (sidebarUserAvatar) {
        if (userProfilePhoto && userProfilePhoto !== 'undefined' && userProfilePhoto !== 'null') {
            // Fix avatar path
            sidebarUserAvatar.src = userProfilePhoto.startsWith('/') || userProfilePhoto.startsWith('http') 
                ? userProfilePhoto 
                : `/uploads/${userProfilePhoto}`;
            console.log('Setting sidebar avatar to:', sidebarUserAvatar.src);
        } else {
            sidebarUserAvatar.src = '/assets/images/default-avatar.png';
            console.log('Setting sidebar avatar to default');
        }
        sidebarUserAvatar.alt = userFullName || 'User Avatar';
    }
    
    if (userName) {
        userName.textContent = userFullName || 'User';
        console.log('Setting user name to:', userFullName || 'User');
    }
    
    if (userHandle) {
        const displayUsername = userData?.username || userData?.rollNumber || 'user';
        userHandle.textContent = `@${displayUsername}`;
        console.log('Setting user handle to:', `@${displayUsername}`);
    }
    
    // Update post creation area
    const postUserAvatar = document.getElementById("postUserAvatar");
    const postUserName = document.getElementById("postUserName");
    const postUserHandle = document.getElementById("postUserHandle");
    
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
    
    if (postUserName) {
        postUserName.textContent = userFullName || 'User';
        console.log('Setting post user name to:', userFullName || 'User');
    }
    
    if (postUserHandle) {
        const displayUsername = userData?.username || 'user';
        postUserHandle.textContent = `@${displayUsername}`;
        console.log('Setting post user handle to:', `@${displayUsername}`);
    }
    
    // If we don't have user data in localStorage, fetch it from the server
    if (!userFullName || !userUsername || !userProfilePhoto) {
        try {
            const response = await fetch('/api/users/my-profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched user data from server:', data);
                // Update localStorage with fetched data
                localStorage.setItem('user', JSON.stringify(data));
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
    
    // Load posts after all initialization is complete
    await loadPosts();
});

// Emoji Picker Implementation
let emojiPicker = null;
const emojiPickerContainer = document.getElementById('emoji-picker-container');
const emojiPickerBtn = document.getElementById('emojiPickerBtn');

// Initialize emoji picker
async function onEmojiSelect(emoji) {
    console.log('Emoji selected:', emoji);
    // Check if emoji has native property (emoji-mart v5+) or is a string
    const emojiChar = typeof emoji === 'object' ? (emoji.native || emoji.emoji) : emoji;
    insertEmoji(emojiChar);
}

function initializeEmojiPicker() {
    console.log('Initializing emoji picker');
    
    try {
        // Check if emoji-mart browser module is available
        if (typeof window.EmojiMart !== 'undefined') {
            console.log('EmojiMart is available, creating picker');
            // Clear any existing content
            if (emojiPickerContainer) {
                emojiPickerContainer.innerHTML = '';
            }
            
            // Create the picker using EmojiMart browser API
            emojiPicker = new window.EmojiMart.Picker({
                onEmojiSelect: onEmojiSelect,
                theme: document.body.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light',
                autoFocus: true,
                emojiSize: 24,
                perLine: 8,
                categories: ['people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags'],
                emojiButtonColors: ['rgba(1, 152, 99, 0.5)'],
                emojiButtonRadius: '24px',
                emojiButtonSize: '32px',
                set: 'native'
            });
            
            // Mount the picker
            if (emojiPickerContainer) {
                emojiPickerContainer.appendChild(emojiPicker);
                console.log('Emoji picker mounted successfully');
            }
        } else {
            console.log('EmojiMart not available, using fallback');
            createFallbackEmojiPicker();
        }
    } catch (error) {
        console.error('Error initializing emoji picker:', error);
        createFallbackEmojiPicker();
    }
}

// Simple fallback emoji picker if EmojiMart is not available
function createFallbackEmojiPicker() {
    if (!emojiPickerContainer) return;
    emojiPickerContainer.innerHTML = '';
    const emojis = ['😀','😂','😍','😎','😊','😉','😭','😡','👍','🙏','🔥','🎉','💯','🥳','🤔','😅','😇','😜','😏','😬','🤩','🥺','🤯','😱','😤','😴','🤗','😋','😝','😒','😔','😳','😢','😞','😩','😠','😡','🤬','😷','🤒','🤕','🤑','🤠','😈','👻','💀','👽','🤖','🎃'];
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-button';
        btn.textContent = emoji;
        btn.onclick = () => insertEmoji(emoji);
        grid.appendChild(btn);
    });
    emojiPickerContainer.appendChild(grid);
    emojiPickerContainer.style.display = 'block';
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

// Add click handlers for upload buttons
if (imageUploadBtn) {
    imageUploadBtn.addEventListener('click', () => {
        imageInput.click();
    });
}

if (videoUploadBtn) {
    videoUploadBtn.addEventListener('click', () => {
        videoInput.click();
    });
}

if (imageInput) {
    imageInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to upload images');
            window.location.href = '/login';
            return;
        }

        // Show preview before upload
        const previewContainer = document.getElementById('mediaPreviewContainer');
        if (!previewContainer) {
            const container = document.createElement('div');
            container.id = 'mediaPreviewContainer';
            container.className = 'media-preview-container mb-3';
            container.style.position = 'relative';
            postContent.parentElement.insertBefore(container, postContent.nextSibling);
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('mediaPreviewContainer');
            previewContainer.innerHTML = `
                <div class="position-relative">
                    <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 300px; width: auto;" alt="Preview">
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="removeMediaPreview()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `;
        }
        reader.readAsDataURL(file);

        // Store the current media file for later upload
        currentMediaFile = file;
        currentMediaType = 'image';
    });
}

if (videoInput) {
    videoInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to upload videos');
                    window.location.href = '/login';
                    return;
                }

        // Show preview before upload
        const previewContainer = document.getElementById('mediaPreviewContainer');
        if (!previewContainer) {
            const container = document.createElement('div');
            container.id = 'mediaPreviewContainer';
            container.className = 'media-preview-container mb-3';
            container.style.position = 'relative';
            postContent.parentElement.insertBefore(container, postContent.nextSibling);
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('mediaPreviewContainer');
            previewContainer.innerHTML = `
                <div class="position-relative">
                    <video src="${e.target.result}" class="img-fluid rounded" style="max-height: 300px; width: auto;" controls></video>
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="removeMediaPreview()">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `;
        }
        reader.readAsDataURL(file);

        // Store the current media file for later upload
        currentMediaFile = file;
        currentMediaType = 'video';
    });
}

// Function to remove media preview
window.removeMediaPreview = function() {
    const previewContainer = document.getElementById('mediaPreviewContainer');
    if (previewContainer) {
        previewContainer.remove();
    }
    currentMediaFile = null;
    currentMediaType = null;
    // Clear file inputs
    if (imageInput) imageInput.value = '';
    if (videoInput) videoInput.value = '';
};

// Handle post submission
const createPostForm = document.getElementById('createPostForm');
if (createPostForm) {
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = postContent.value.trim();
        const token = localStorage.getItem('token');
        
        if (!token) {
            showError('You are not logged in. Please log in to create a post.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (currentMediaFile) {
                formData.append(currentMediaType, currentMediaFile);
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error && errorData.error.includes('File too large')) {
                    showError('The uploaded file is too large. Please upload a video smaller than 100MB.');
                } else {
                    showError(errorData.message || 'Failed to create post.');
                }
                return;
            }

            const data = await response.json();
            showSuccess('Post created successfully!');
            createPostForm.reset();
            removeMediaPreview();
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            showError('An error occurred while creating the post. Please try again.');
        }
    });
}

// Show success message
function showSuccess(message) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

// Initialize the emoji picker on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing emoji picker');
    
    // Check if required elements exist
    const emojiPickerContainer = document.getElementById('emoji-picker-container');
    const emojiPickerBtn = document.getElementById('emojiPickerBtn');
    const postContent = document.getElementById('postContent');
    
    if (!emojiPickerContainer || !emojiPickerBtn || !postContent) {
        console.error('Required elements for emoji picker not found');
        return;
    }
    
    // Initialize emoji picker
    initializeEmojiPicker();
    
    // Add click handler for emoji picker button
    emojiPickerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleEmojiPicker();
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (emojiPickerContainer.style.display === 'block' && 
            !emojiPickerContainer.contains(e.target) && 
            !emojiPickerBtn.contains(e.target)) {
            emojiPickerContainer.style.display = 'none';
        }
    });
});

// Handle image upload
const handleImageUpload = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/uploads/post-image', {
                method: 'POST',
                body: formData
            });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.filePath;
        } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
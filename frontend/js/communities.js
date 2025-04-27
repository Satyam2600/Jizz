// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Communities page loaded');
    
    // Debug token retrieval
    const token = localStorage.getItem("token");
    console.log('Token from localStorage:', token ? 'Present' : 'Not present');
    
    if (!token) {
        console.log('No token found - showing login prompt');
        showLoginPrompt();
        return;
    }
    
    try {
        // Remove the jwtDecode check since we'll validate the token with the server
        console.log('Token found, loading communities');
        loadCommunities();
        setupFileUploads();
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem("token");
        showLoginPrompt();
    }
});

function showLoginPrompt() {
    // Create a login prompt overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const promptBox = document.createElement('div');
    promptBox.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
    `;
    
    promptBox.innerHTML = `
        <h2>Login Required</h2>
        <p>Please log in to view communities</p>
        <button onclick="window.location.href='/login.html'" style="
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        ">Go to Login</button>
    `;
    
    overlay.appendChild(promptBox);
    document.body.appendChild(overlay);
}

function loadCommunities() {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginPrompt();
        return;
    }

    // Load communities data
    console.log('Loading communities data');
    axios.get('/api/communities', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        if (response.data.success) {
            // Update the communities container with the data
            const container = document.getElementById('communities-container');
            if (response.data.communities.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h3>No Communities Yet</h3>
                        <p class="text-muted">Be the first to create a community!</p>
                    </div>
                `;
            } else {
                // Render communities
                container.innerHTML = response.data.communities.map(community => `
                    <div class="col-md-6 col-lg-4">
                        <div class="card community-card">
                            <div class="community-cover" style="background-image: url('${community.coverImage || '/assets/images/default-cover.jpg'}')">
                                <img src="${community.avatar || '/assets/images/default-avatar.jpg'}" class="community-avatar" alt="${community.name}">
                            </div>
                            <div class="community-info">
                                <h3 class="h5 mb-2">${community.name}</h3>
                                <p class="text-muted mb-3">${community.description}</p>
                                <div class="community-stats">
                                    <span><i class="fas fa-users"></i> ${community.members.length} members</span>
                                    <span><i class="fas fa-calendar"></i> ${new Date(community.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div class="mt-3">
                                    ${community.isMember ? 
                                        `<button class="btn btn-outline-primary btn-sm" onclick="leaveCommunity('${community._id}')">
                                            <i class="fas fa-sign-out-alt"></i> Leave
                                        </button>` :
                                        `<button class="btn btn-primary btn-sm" onclick="joinCommunity('${community._id}')">
                                            <i class="fas fa-sign-in-alt"></i> Join
                                        </button>`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    })
    .catch(error => {
        console.error('Error loading communities:', error);
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem("token");
            showLoginPrompt();
        } else {
            alert('Failed to load communities. Please try again.');
        }
    });
}

function setupFileUploads() {
    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');

    avatarUpload.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (e) => handleFileSelect(e, avatarPreview));

    // Cover image upload
    const coverUpload = document.getElementById('coverUpload');
    const coverInput = document.getElementById('coverInput');
    const coverPreview = document.getElementById('coverPreview');

    coverUpload.addEventListener('click', () => coverInput.click());
    coverInput.addEventListener('change', (e) => handleFileSelect(e, coverPreview));
}

function handleFileSelect(event, previewElement) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
            previewElement.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }
}

function joinCommunity(communityId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginPrompt();
        return;
    }

    axios.post(`/api/communities/${communityId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        if (response.data.success) {
            // Refresh the page or update UI
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error joining community:', error);
        alert('Failed to join community. Please try again.');
    });
}

function leaveCommunity(communityId) {
    const token = localStorage.getItem('token');
    if (!token) {
        showLoginPrompt();
        return;
    }

    axios.post(`/api/communities/${communityId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
        if (response.data.success) {
            // Refresh the page or update UI
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error leaving community:', error);
        alert('Failed to leave community. Please try again.');
    });
}

// Handle community creation form submission
document.getElementById('createCommunityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem('token');
    
    // Debug - log form data
    console.log('Form data being sent:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    if (!token) {
        showLoginPrompt();
        return;
    }
    
    try {
        const response = await axios.post('/api/communities', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.data.success) {
            // Close modal and refresh page
            const modal = bootstrap.Modal.getInstance(document.getElementById('createCommunityModal'));
            modal.hide();
            window.location.reload();
        } else {
            // Handle successful response without success flag
            console.log('Community created:', response.data);
            const modal = bootstrap.Modal.getInstance(document.getElementById('createCommunityModal'));
            modal.hide();
            window.location.reload();
        }
    } catch (error) {
        console.error('Error creating community:', error);
        if (error.response && error.response.data) {
            alert(`Failed to create community: ${error.response.data.error}`);
        } else {
            alert('Failed to create community. Please try again.');
        }
    }
});
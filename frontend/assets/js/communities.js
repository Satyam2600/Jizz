// Function to get token
function getToken() {
    return localStorage.getItem("token");
}

// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
}

// Function to handle API requests
async function apiRequest(endpoint, method, data = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add token to headers if it exists
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, {
            method: method,
            headers: headers,
            body: data ? JSON.stringify(data) : null
        });

        const result = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = '/communities';
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(result.error || 'Request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = '/communities';
        return;
    }

    // Tab switching
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            fetchCommunities(tab.dataset.tab, document.getElementById('communitySearch').value);
        });
    });

    // Search
    document.getElementById('communitySearch').addEventListener('input', function() {
        fetchCommunities(document.querySelector('.tab-link.active').dataset.tab, this.value);
    });

    // Join button
    document.getElementById('communitiesGrid').addEventListener('click', function(e) {
        if (e.target.classList.contains('join-btn')) {
            const id = e.target.dataset.id;
            apiRequest(`/api/communities/${id}/join`, 'POST')
                .then(() => fetchCommunities(document.querySelector('.tab-link.active').dataset.tab, document.getElementById('communitySearch').value))
                .catch(error => alert(error.message));
        }
    });

    // Create community
    document.getElementById('createCommunityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        apiRequest('/api/communities', 'POST', Object.fromEntries(formData))
            .then(() => {
                fetchCommunities('all');
                bootstrap.Modal.getInstance(document.getElementById('createCommunityModal')).hide();
                this.reset();
            })
            .catch(error => alert(error.message));
    });

    // Initial load
    fetchCommunities('all');
});

async function fetchCommunities(tab, search = '') {
    try {
        const url = `/api/communities?tab=${tab}&search=${encodeURIComponent(search)}`;
        const data = await apiRequest(url, 'GET');
        
        // Render communities
        const grid = document.getElementById('communitiesGrid');
        grid.innerHTML = '';
        if (!data.length) {
            grid.innerHTML = '<div class="text-center text-muted py-5">There are no communities yet. Be the first to <b>create a community</b>!</div>';
            return;
        }
        data.forEach(community => {
            grid.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="community-card h-100">
                        <img src="${community.coverImage}" class="community-img" alt="Community Image">
                        <div class="p-3">
                            <div class="community-title mb-1">${community.name}</div>
                            <div class="community-desc mb-2">${community.description}</div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-success">${community.category}</span>
                                <span class="text-muted small"><i class="bi bi-people"></i> ${community.members.length} members</span>
                            </div>
                            <button class="btn btn-outline-success btn-sm mt-3 w-100 join-btn" data-id="${community._id}">
                                ${community.isMember ? 'Joined' : 'Join'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        alert('Failed to load communities. Please try again.');
    }
} 
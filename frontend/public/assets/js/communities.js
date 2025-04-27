// Global variables for communities
let allCommunities = [];
let filteredCommunities = [];

// Function to get token
function getToken() {
  return localStorage.getItem("token");
}

// Function to check if user is authenticated
function isAuthenticated() {
  const token = localStorage.getItem("token");
  return !!token;
}

// Toast notification function
function showToast(title, message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${title}:</strong> ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  
  const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
  toast.show();
}

// Join community function
function joinCommunity(communityId) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  axios.post(`/api/communities/${communityId}/join`, {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    showToast('Success', 'You have joined the community!', 'success');
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(error => {
    if (error.response && error.response.data && error.response.data.error === 'Already a member of this community') {
      showToast('Information', 'You are already a member of this community', 'info');
    } else {
      showToast('Error', error.response?.data?.error || 'Failed to join community', 'error');
    }
  });
}

// Leave community function
function leaveCommunity(communityId) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  axios.post(`/api/communities/${communityId}/leave`, {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    showToast('Success', 'You have left the community', 'success');
    setTimeout(() => window.location.reload(), 1000);
  })
  .catch(error => {
    showToast('Error', error.response?.data?.error || 'Failed to leave community', 'error');
  });
}

// Manage community function
function manageCommunity(communityId) {
  window.location.href = `/communities/${communityId}/manage`;
}

// Function to filter communities based on search, tab, and category
function filterCommunities() {
  const searchTerm = document.getElementById('communitySearch').value.toLowerCase();
  const currentTab = document.querySelector('.nav-tabs .nav-link.active').getAttribute('data-tab');
  const currentCategory = document.querySelector('.category-filter.btn-primary')?.getAttribute('data-category') || 'all';
  
  // First filter by search term
  let filtered = allCommunities.filter(community => 
    community.name.toLowerCase().includes(searchTerm) || 
    community.description.toLowerCase().includes(searchTerm)
  );
  
  // Then apply tab filter
  if (currentTab === 'trending') {
    filtered.sort((a, b) => b.members.length - a.members.length);
    document.getElementById('communitiesTitle').textContent = 'Trending Communities';
  } else if (currentTab === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    document.getElementById('communitiesTitle').textContent = 'Newest Communities';
  } else if (currentTab === 'category') {
    document.getElementById('communitiesTitle').textContent = 'Communities by Category';
    // Show category filters
    document.getElementById('categoryFilters').classList.remove('d-none');
    
    // Apply category filter if not "all"
    if (currentCategory !== 'all') {
      filtered = filtered.filter(community => 
        community.category.toLowerCase() === currentCategory.toLowerCase()
      );
    }
  } else {
    // All communities
    document.getElementById('communitiesTitle').textContent = 'All Communities';
    document.getElementById('categoryFilters').classList.add('d-none');
  }
  
  filteredCommunities = filtered;
  renderCommunities(filteredCommunities);
}

// Function to render communities to the DOM
function renderCommunities(communities) {
  const container = document.getElementById('communities-container');
  
  if (!communities || communities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="bi bi-people"></i>
        </div>
        <h3 class="empty-state-title">No Communities Found</h3>
        <p class="empty-state-text">No communities match your current filters. Try adjusting your search or create a new community!</p>
        <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#createCommunityModal">
          <i class="bi bi-plus-circle me-2"></i>Create a Community
        </button>
      </div>
    `;
    return;
  }
  
  let html = '';
  communities.forEach(community => {
    html += `
      <div class="community-card">
        <div class="community-image" style="background-image: url('${community.coverImage || "/assets/images/default-cover.jpg"}');">
          <img src="${community.avatar || '/assets/images/default-avatar.jpg'}" class="community-logo" alt="${community.name}">
          ${community.isCreator ? `
            <div class="creator-badge">
              <i class="bi bi-star-fill me-1"></i> Creator
            </div>
          ` : ''}
        </div>
        <div class="community-content">
          <span class="category-badge"><i class="bi bi-tag"></i> ${community.category}</span>
          <h3 class="community-title">${community.name}</h3>
          <p class="community-description">${community.description}</p>
          <div class="community-meta">
            <span><i class="bi bi-people"></i> ${community.members.length} members</span>
            <span><i class="bi bi-calendar"></i> ${new Date(community.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            ${community.isCreator ? `
              <button class="btn btn-outline-success btn-manage" onclick="manageCommunity('${community._id}')">
                <i class="bi bi-gear me-1"></i>Manage
              </button>
            ` : community.isMember ? `
              <button class="btn btn-outline-primary btn-leave" onclick="leaveCommunity('${community._id}')">
                <i class="bi bi-box-arrow-left me-1"></i>Leave
              </button>
            ` : `
              <button class="btn btn-primary btn-join" onclick="joinCommunity('${community._id}')">
                <i class="bi bi-box-arrow-in-right me-1"></i>Join
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Function to fetch communities from the API
async function fetchCommunities() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    const response = await axios.get('/api/communities', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    allCommunities = response.data;
    filteredCommunities = [...allCommunities];
    renderCommunities(filteredCommunities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    showToast('Error', 'Failed to load communities', 'error');
  }
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
        window.location.href = '/login';
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

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const themeIcon = themeToggle?.querySelector('i');
  
  // Set initial theme based on localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-bs-theme', currentTheme);
  
  // Update icon based on current theme
  if (themeIcon) {
    if (currentTheme === 'dark') {
      themeIcon.classList.remove('bi-moon-fill');
      themeIcon.classList.add('bi-sun-fill');
    } else {
      themeIcon.classList.remove('bi-sun-fill');
      themeIcon.classList.add('bi-moon-fill');
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', function() {
      const currentTheme = htmlElement.getAttribute('data-bs-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Update theme
      htmlElement.setAttribute('data-bs-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      if (newTheme === 'dark') {
        themeIcon.classList.remove('bi-moon-fill');
        themeIcon.classList.add('bi-sun-fill');
      } else {
        themeIcon.classList.remove('bi-sun-fill');
        themeIcon.classList.add('bi-moon-fill');
      }
    });
  }
  
  // File upload preview for avatar
  const avatarUpload = document.getElementById('avatarUpload');
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  
  if (avatarUpload && avatarInput && avatarPreview) {
    avatarUpload.addEventListener('click', function() {
      avatarInput.click();
    });
    
    avatarInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          avatarPreview.src = e.target.result;
          avatarPreview.classList.remove('d-none');
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
  
  // File upload preview for cover
  const coverUpload = document.getElementById('coverUpload');
  const coverInput = document.getElementById('coverInput');
  const coverPreview = document.getElementById('coverPreview');
  
  if (coverUpload && coverInput && coverPreview) {
    coverUpload.addEventListener('click', function() {
      coverInput.click();
    });
    
    coverInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          coverPreview.src = e.target.result;
          coverPreview.classList.remove('d-none');
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
  
  // Set up event listeners for search and tabs
  const searchInput = document.getElementById('communitySearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterCommunities);
  }
  
  // Tab navigation
  const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
  tabLinks.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update active tab
      tabLinks.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Apply filters
      filterCommunities();
    });
  });
  
  // Category filter buttons
  const categoryButtons = document.querySelectorAll('.category-filter');
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active button
      categoryButtons.forEach(b => b.classList.remove('btn-primary'));
      categoryButtons.forEach(b => b.classList.add('btn-outline-secondary'));
      this.classList.remove('btn-outline-secondary');
      this.classList.add('btn-primary');
      
      // Apply filters
      filterCommunities();
    });
  });
  
  // Create community form submission
  const createCommunityForm = document.getElementById('createCommunityForm');
  if (createCommunityForm) {
    createCommunityForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      try {
        const response = await fetch('/api/communities', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create community');
        }
        
        // Show success message
        showToast('Success', 'Community created successfully!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createCommunityModal'));
        modal.hide();
        
        // Refresh communities
        fetchCommunities();
      } catch (error) {
        console.error('Error creating community:', error);
        showToast('Error', error.message || 'Failed to create community', 'error');
      }
    });
  }
  
  // Initialize by fetching communities
  fetchCommunities();
});
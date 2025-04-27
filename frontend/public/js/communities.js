// Communities page JavaScript

// Initialize file upload previews
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const themeIcon = themeToggle.querySelector('i');
  
  // Set initial theme based on localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-bs-theme', currentTheme);
  
  // Update icon based on current theme
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

  // Communities data management
  let allCommunities = [];
  let filteredCommunities = [];
  let currentTab = 'all';
  let currentCategory = 'all';
  
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
      
      // Update current tab
      currentTab = this.getAttribute('data-tab');
      
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
      
      // Update current category
      currentCategory = this.getAttribute('data-category');
      
      // Apply filters
      filterCommunities();
    });
  });

  // Function to filter communities based on search, tab, and category
  function filterCommunities() {
    const searchTerm = document.getElementById('communitySearch').value.toLowerCase();
    
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
});

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
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
    if (error.response && error.response.data) {
      if (error.response.data.error === 'Already a member of this community') {
        showToast('Information', 'You are already a member of this community', 'info');
      } else {
        showToast('Error', error.response.data.error || 'Failed to join community', 'error');
      }
    } else {
      showToast('Error', 'An unexpected error occurred', 'error');
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

// Toast notification function
function showToast(title, message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  
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
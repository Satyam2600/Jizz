// Event loading and management
let currentTab = 'all';
let currentFilters = {
  category: '',
  search: ''
};

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('#themeToggle i');
  if (!themeIcon) return;
  
  if (theme === 'dark') {
    themeIcon.classList.remove('bi-moon-fill');
    themeIcon.classList.add('bi-sun-fill');
  } else {
    themeIcon.classList.remove('bi-sun-fill');
    themeIcon.classList.add('bi-moon-fill');
  }
}

// Load events when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    initTheme();
    loadEvents();
    setupEventListeners();
  }
});

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleTheme();
    });
  }

  // Search input
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.trim();
      loadEvents();
    });
  }

  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentFilters.category = e.target.value;
      loadEvents();
    });
  }

  // Filter button
  const filterButton = document.querySelector('.filter-button');
  if (filterButton) {
    filterButton.addEventListener('click', () => {
      loadEvents();
    });
  }

  // Tab navigation
  document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-tabs .nav-link').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      // Reset filters when changing tabs
      currentFilters = {
        search: '',
        category: '',
      };
      // Reset form inputs
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = '';
      loadEvents();
    });
  });

  // Cover image preview
  document.getElementById('eventCover').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('coverPreview').src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Create event button
  document.getElementById('createEventButton').addEventListener('click', createEvent);

  // Logout button
  document.getElementById('logoutButton').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/login';
  });
}

// Load events from server
async function loadEvents() {
  if (!checkAuth()) return;

  try {
    const queryParams = new URLSearchParams();
    
    // Add search term if exists
    if (currentFilters.search) {
      queryParams.append('search', currentFilters.search);
    }
    
    // Add category filter if exists
    if (currentFilters.category) {
      queryParams.append('category', currentFilters.category);
    }

    const token = localStorage.getItem('token');
    let url = '/api/events';
    
    // Change endpoint based on current tab
    if (currentTab === 'your-events') {
      url = '/api/events/your-events';
    } else if (currentTab === 'saved-events') {
      url = '/api/events/saved-events';
    }

    const response = await fetch(`${url}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to load events: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to load events');
    }

    displayEvents(data.data);
  } catch (error) {
    console.error('Error loading events:', error);
    showError(`Failed to load events: ${error.message}`);
  }
}

// Display events in the container
function displayEvents(events) {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No events found</p></div>';
    return;
  }

  events.forEach(event => {
    const eventCard = createEventCard(event);
    container.appendChild(eventCard);
  });
}

// Create event card element
function createEventCard(event) {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Check if event is saved by current user
  const isSaved = event.savedBy && event.savedBy.includes(getCurrentUserId());

  const userId = localStorage.getItem('userId');
  const isParticipant = event.participants && event.participants.some(p => p._id === userId);

  let actionBtn = '';
  if (isParticipant) {
    actionBtn = `<button class="btn btn-outline-danger" onclick="leaveEvent('${event._id}')">Leave Event</button>`;
  } else {
    actionBtn = `<button class="btn btn-primary" onclick="joinEvent('${event._id}')">Join Event</button>`;
  }

  col.innerHTML = `
    <div class="event-card">
      <img src="${event.coverImage || 'https://via.placeholder.com/500x300?text=No+Image'}" 
           class="event-image w-100" alt="${event.title}">
      <div class="event-details">
        <h3 class="event-title">${event.title}</h3>
        <div class="event-meta">
          <div class="event-meta-item">
            <i class="bi bi-calendar"></i>
            <span>${formattedDate}</span>
          </div>
          <div class="event-meta-item">
            <i class="bi bi-geo-alt"></i>
            <span>${event.location}</span>
          </div>
          <div class="event-meta-item">
            <i class="bi bi-people"></i>
            <span>${event.participants.length}/${event.maxParticipants}</span>
          </div>
        </div>
        <p class="event-description">${event.description}</p>
        <div class="event-actions">
          <div class="event-participants">
            <div class="participant-avatars">
              ${event.participants.slice(0, 3).map(p => `
                <img src="${p.avatar || 'https://via.placeholder.com/24'}" 
                     class="participant-avatar" alt="${p.name}">
              `).join('')}
              ${event.participants.length > 3 ? `
                <span class="participant-avatar bg-secondary text-white d-flex align-items-center justify-content-center">
                  +${event.participants.length - 3}
                </span>
              ` : ''}
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" onclick="saveEvent('${event._id}')">
              <i class="bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
            </button>
            ${actionBtn}
          </div>
        </div>
      </div>
    </div>
  `;

  return col;
}

// Create new event
async function createEvent() {
  if (!checkAuth()) return;

  try {
    const form = document.getElementById('createEventForm');
    const formData = new FormData();

    // Add form fields
    formData.append('title', document.getElementById('eventTitle').value);
    formData.append('description', document.getElementById('eventDescription').value);
    formData.append('location', document.getElementById('eventLocation').value);
    formData.append('date', document.getElementById('eventDate').value);
    formData.append('time', document.getElementById('eventTime').value);
    formData.append('duration', document.getElementById('eventDuration').value);
    formData.append('category', document.getElementById('eventCategory').value);
    formData.append('maxParticipants', document.getElementById('maxParticipants').value);
    formData.append('tags', document.getElementById('eventTags').value);
    formData.append('requirements', document.getElementById('eventRequirements').value);

    // Add cover image if selected
    const coverImage = document.getElementById('eventCover').files[0];
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    const token = localStorage.getItem('token');
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to create event');
    }

    const event = await response.json();
    
    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
    form.reset();
    document.getElementById('coverPreview').src = 'https://via.placeholder.com/500x300?text=Upload+Cover+Image';

    // Reload events
    loadEvents();
  } catch (error) {
    console.error('Error creating event:', error);
    showError('Failed to create event. Please try again.');
  }
}

// Join event
async function joinEvent(eventId) {
  if (!checkAuth()) return;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${eventId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      showToast(data.message || 'Failed to join event', 'danger');
      throw new Error(data.message || 'Failed to join event');
    }
    showToast('Successfully joined the event!', 'success');
    loadEvents();
  } catch (error) {
    console.error('Error joining event:', error);
    showToast('Failed to join event. Please try again.', 'danger');
  }
}

// Leave event
async function leaveEvent(eventId) {
  if (!checkAuth()) return;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${eventId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    if (!response.ok) {
      showToast(data.message || 'Failed to leave event', 'danger');
      throw new Error(data.message || 'Failed to leave event');
    }
    showToast(data.message || 'Successfully left the event!', 'success');
    loadEvents();
  } catch (error) {
    // Always show the error message in the toast
    showToast(error.message || 'Failed to leave event. Please try again.', 'danger');
    console.error('Error leaving event:', error);
  }
}

// Save event
async function saveEvent(eventId) {
  if (!checkAuth()) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/events/${eventId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    // Reload events to update the UI
    loadEvents();
  } catch (error) {
    console.error('Error saving event:', error);
    showError('Failed to save event. Please try again.');
  }
}

// Get current user ID
function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

// Show error message
function showError(message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger alert-dismissible fade show';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.querySelector('.container').insertBefore(alert, document.querySelector('.hero-section'));
  setTimeout(() => alert.remove(), 5000);
}

// Toast utility
function showToast(message, type = 'success') {
  let toast = document.getElementById('event-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'event-toast';
    toast.className = 'toast align-items-center text-bg-' + (type === 'success' ? 'success' : 'danger') + ' border-0 position-fixed bottom-0 end-0 m-4';
    toast.style.zIndex = 9999;
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body"></div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-body').textContent = message;
  toast.className = 'toast align-items-center text-bg-' + (type === 'success' ? 'success' : 'danger') + ' border-0 position-fixed bottom-0 end-0 m-4';
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
} 
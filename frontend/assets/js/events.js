async function saveEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to save event');
    }

    const data = await response.json();
    if (data.success) {
      alert('Event saved successfully!');
      loadTabEvents('saved-events'); // Reload saved events tab
    } else {
      alert('Failed to save event: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving event:', error);
    alert('An error occurred while saving the event.');
  }
}

// Attach event listener to save buttons
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('save-event-button')) {
    const eventId = e.target.dataset.eventId;
    saveEvent(eventId);
  }
});

// Handle cover image upload preview
document.getElementById('eventCover').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('coverPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Store current tab and search state
let currentTab = 'all';
let currentSearch = '';

// Function to load events based on tab and search
async function loadEvents() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        let url = '/api/events';
        if (currentTab === 'your-events') {
            url = '/api/events/your-events';
        } else if (currentTab === 'saved-events') {
            url = '/api/events/saved-events';
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load events');
        }

        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.data)) {
            console.error('Invalid response format:', data);
            return;
        }

        let events = data.data;

        // Apply search filter if search term exists
        if (currentSearch) {
            events = events.filter(event => 
                event.title.toLowerCase().includes(currentSearch.toLowerCase())
            );
        }

        const container = document.getElementById('eventsContainer');
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No events found</p></div>';
            return;
        }

        events.forEach(event => {
            const eventCard = createEventCard(event);
            container.appendChild(eventCard);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        const container = document.getElementById('eventsContainer');
        container.innerHTML = '<div class="col-12 text-center"><p>Error loading events. Please try again later.</p></div>';
    }
}

// Handle tab clicks
document.querySelectorAll('.nav-tabs .nav-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tabs .nav-link').forEach(t => 
            t.classList.remove('active')
        );
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update current tab
        currentTab = this.dataset.tab;
        
        // Reload events
        loadEvents();
    });
});

// Handle search
document.querySelector('.search-input').addEventListener('input', function(e) {
    currentSearch = e.target.value;
    loadEvents();
});

// Handle category filter
document.getElementById('categoryFilter').addEventListener('change', function(e) {
    currentSearch = e.target.value;
    loadEvents();
});

// Handle status filter
document.getElementById('statusFilter').addEventListener('change', function(e) {
    currentSearch = e.target.value;
    loadEvents();
});

// Function to create event card
function createEventCard(event) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    // Check if user is already a participant
    const isParticipant = event.participants.some(p => p._id === currentUserId);
    const isFull = event.participants.length >= event.maxParticipants;
    const isCreator = event.createdBy._id === currentUserId;
    
    col.innerHTML = `
        <div class="event-card">
            <img src="${event.coverImage || 'https://via.placeholder.com/500x300?text=No+Image'}" 
                 class="event-image" alt="${event.title}">
            <div class="event-details">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <span class="event-meta-item">
                        <i class="bi bi-geo-alt"></i>${event.location}
                    </span>
                    <span class="event-meta-item">
                        <i class="bi bi-calendar"></i>${new Date(event.date).toLocaleDateString()}
                    </span>
                    <span class="event-meta-item">
                        <i class="bi bi-clock"></i>${event.time}
                    </span>
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-actions">
                    <div class="event-participants">
                        <i class="bi bi-people"></i>
                        <span>${event.participants.length}/${event.maxParticipants}</span>
                    </div>
                    ${isCreator ? 
                        `<button class="btn btn-info btn-sm" disabled>Event Creator</button>` :
                        isParticipant ?
                            `<button class="btn btn-danger btn-sm" onclick="leaveEvent('${event._id}')">Leave Event</button>` :
                            `<button class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} btn-sm" 
                                    onclick="joinEvent('${event._id}')"
                                    ${isFull ? 'disabled' : ''}>
                                ${isFull ? 'Event Full' : 'Join Event'}
                            </button>`
                    }
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Function to join an event
async function joinEvent(eventId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to join events');
            window.location.href = '/login';
            return;
        }

        const response = await fetch(`/api/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to join event');
        }

        // Show success message
        alert(data.message);
        
        // Reload events to update the UI
        loadEvents();
    } catch (error) {
        console.error('Error joining event:', error);
        alert(error.message || 'Failed to join event. Please try again.');
    }
}

// Get current user ID from token
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

// Store current user ID
const currentUserId = getCurrentUserId();

// Handle create event form submission
document.getElementById('createEventButton').addEventListener('click', async function() {
    const form = document.getElementById('createEventForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to create an event');
            window.location.href = '/login';
            return;
        }

        // Create FormData object
        const formData = new FormData();
        
        // Add all form fields to FormData
        const formFields = {
            title: document.getElementById('eventTitle').value.trim(),
            location: document.getElementById('eventLocation').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            duration: parseInt(document.getElementById('eventDuration').value),
            category: document.getElementById('eventCategory').value,
            description: document.getElementById('eventDescription').value.trim(),
            maxParticipants: parseInt(document.getElementById('maxParticipants').value),
            tags: document.getElementById('eventTags').value.trim(),
            requirements: document.getElementById('eventRequirements').value.trim()
        };

        // Validate required fields
        const requiredFields = ['title', 'location', 'date', 'time', 'duration', 'category', 'description', 'maxParticipants'];
        const missingFields = requiredFields.filter(field => !formFields[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }

        // Append each field to FormData
        Object.entries(formFields).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        
        // Handle cover image
        const coverImage = document.getElementById('eventCover').files[0];
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        // Log the FormData contents for debugging
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create event');
        }

        const result = await response.json();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createEventModal'));
        modal.hide();

        // Reset the form
        form.reset();
        document.getElementById('coverPreview').src = 'https://via.placeholder.com/500x300?text=Upload+Cover+Image';

        // Show success message
        alert('Event created successfully!');
        
        // Reload the events list
        loadEvents();
    } catch (error) {
        console.error('Error creating event:', error);
        alert(error.message || 'Failed to create event. Please try again.');
    }
});

// Function to leave an event
async function leaveEvent(eventId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to leave events');
            window.location.href = '/login';
            return;
        }

        const response = await fetch(`/api/events/${eventId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to leave event');
        }

        // Show success message
        alert(data.message);
        
        // Reload events to update the UI
        loadEvents();
    } catch (error) {
        console.error('Error leaving event:', error);
        alert(error.message || 'Failed to leave event. Please try again.');
    }
}

// Load events when the page loads
document.addEventListener('DOMContentLoaded', loadEvents);
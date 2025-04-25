// Get the token from localStorage
const token = localStorage.getItem('token');

// Function to make authenticated requests
async function makeAuthenticatedRequest(url, options = {}) {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Function to display events
function displayEvents(events) {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;

    if (!events || events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }

    const eventsHTML = events.map(event => `
        <div class="event-card">
            <h2>${event.title}</h2>
            <p>${event.description}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
        </div>
    `).join('');

    eventsList.innerHTML = eventsHTML;
}

// Load events when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const events = await makeAuthenticatedRequest('/api/events');
        displayEvents(events);
    } catch (error) {
        console.error('Failed to load events:', error);
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            eventsList.innerHTML = '<p>Error loading events. Please try again later.</p>';
        }
    }
}); 
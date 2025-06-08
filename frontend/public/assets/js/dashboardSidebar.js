// Function to fetch and display upcoming events
async function loadUpcomingEvents() {
    try {
        const response = await fetch('/api/events', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        const events = data.success ? data.data : [];
        console.log('Fetched events:', events); // Debug log
        
        // Find the right sidebar (second .sidebar on the page)
        const sidebars = document.querySelectorAll('.sidebar');
        const eventsContainer = sidebars.length > 1 ? sidebars[1].querySelector('.card .card-body') : null;
        
        if (!eventsContainer) {
            console.error('Upcoming Events container not found in the right sidebar.');
            return;
        }
        
        if (events && events.length > 0) {
            // Filter upcoming events manually to ensure correct date comparison
            const now = new Date();
            const upcomingEvents = events
                .filter(event => {
                    const eventDateTime = new Date(event.date);
                    console.log('Comparing event:', event.title, 'Date:', eventDateTime, 'Now:', now); // Debug log
                    return eventDateTime >= now;
                })
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 1);

            if (upcomingEvents.length > 0) {
                const event = upcomingEvents[0];
                console.log('Selected upcoming event:', event); // Debug log
                
                const eventDate = new Date(event.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric' 
                });
                const formattedTime = event.time;
                
                eventsContainer.innerHTML = `
                    <div class="d-flex gap-3 align-items-start mb-3">
                        <div class="bg-success rounded-2 p-2 text-white">
                            <i class="bi bi-calendar-event fs-4"></i>
                        </div>
                        <div>
                            <h6 class="mb-1 fw-semibold">${event.title}</h6>
                            <small class="text-muted">${formattedDate} · ${formattedTime}</small>
                        </div>
                    </div>
                    <button class="btn btn-outline-success w-100 rounded-pill" onclick="window.location.href='/events'">
                        RSVP Now
                    </button>
                `;
            } else {
                console.log('No upcoming events found after filtering'); // Debug log
                eventsContainer.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="bi bi-calendar-event fs-4 mb-2"></i>
                        <p class="mb-0">No upcoming events</p>
                    </div>
                `;
            }
        } else {
            console.log('No events received from API'); // Debug log
            eventsContainer.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-calendar-event fs-4 mb-2"></i>
                    <p class="mb-0">No upcoming events</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading upcoming events:', error);
        const eventsContainer = sidebars.length > 1 ? sidebars[1].querySelector('.card .card-body') : null;
        if (eventsContainer) {
            eventsContainer.innerHTML = `<div class='text-center text-danger py-3'><p class='mb-0'>Error loading events</p></div>`;
        }
    }
}

// Function to fetch and display trending communities
async function loadTrendingCommunities() {
    try {
        const response = await fetch('/api/communities?tab=trending&limit=1', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch communities');
        
        const communities = await response.json();
        const communitiesContainer = document.querySelector('.sidebar .card:last-child .card-body');
        
        if (communities && communities.length > 0) {
            const community = communities[0];
            const memberCount = community.members ? community.members.length : 0;
            
            communitiesContainer.innerHTML = `
                <div class="d-flex gap-3 align-items-center mb-3">
                    <div class="bg-primary rounded-2 p-2 text-white">
                        <i class="bi bi-people fs-4"></i>
                    </div>
                    <div>
                        <h6 class="mb-0 fw-semibold">${community.name}</h6>
                        <small class="text-muted">${memberCount} members</small>
                    </div>
                </div>
                <button class="btn btn-success w-100 rounded-pill" onclick="window.location.href='/communities'">
                    Join Community
                </button>
            `;
        } else {
            communitiesContainer.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-people fs-4 mb-2"></i>
                    <p class="mb-0">No trending communities</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading trending communities:', error);
    }
}

// Load data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingEvents();
    loadTrendingCommunities();
});
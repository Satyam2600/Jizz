// Function to determine event status based on date and time
function getEventStatus(eventDate, eventTime, duration) {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const endDateTime = new Date(eventDateTime.getTime() + (duration * 60 * 60 * 1000)); // Add duration in hours

    // If current time is between event start and end time
    if (now >= eventDateTime && now <= endDateTime) {
        return 'ongoing';
    }

    // If event has ended
    if (now > endDateTime) {
        return 'completed';
    }

    // If event hasn't started yet
    return 'upcoming';
}

// Function to filter events by status
function filterEventsByStatus(events, status) {
    if (!status) return events;
    
    return events.filter(event => {
        const eventStatus = getEventStatus(event.date, event.time, event.duration);
        return eventStatus === status;
    });
}

// Function to get upcoming events (for dashboard)
function getUpcomingEvents(events, limit = 5) {
    const now = new Date();
    return events
        .filter(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            return eventDateTime > now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        })
        .slice(0, limit);
}

// Function to update event status in the UI
function updateEventStatusUI(eventElement, status) {
    const statusBadge = eventElement.querySelector('.event-status');
    if (!statusBadge) return;

    // Remove all status classes
    statusBadge.classList.remove('bg-primary', 'bg-success', 'bg-secondary');
    
    // Add appropriate class based on status
    switch (status) {
        case 'upcoming':
            statusBadge.classList.add('bg-primary');
            statusBadge.textContent = 'Upcoming';
            break;
        case 'ongoing':
            statusBadge.classList.add('bg-success');
            statusBadge.textContent = 'Ongoing';
            break;
        case 'completed':
            statusBadge.classList.add('bg-secondary');
            statusBadge.textContent = 'Completed';
            break;
    }
}

// Function to periodically update event statuses
function startEventStatusUpdates() {
    // Update statuses every minute
    setInterval(() => {
        const eventElements = document.querySelectorAll('.event-card');
        eventElements.forEach(eventElement => {
            const eventDate = eventElement.dataset.date;
            const eventTime = eventElement.dataset.time;
            const eventDuration = parseInt(eventElement.dataset.duration);
            
            if (eventDate && eventTime && eventDuration) {
                const status = getEventStatus(eventDate, eventTime, eventDuration);
                updateEventStatusUI(eventElement, status);
            }
        });
    }, 60000); // Update every minute
}

// Export functions for use in other files
window.eventStatusUtils = {
    getEventStatus,
    filterEventsByStatus,
    getUpcomingEvents,
    updateEventStatusUI,
    startEventStatusUpdates
}; 
// Global real-time chat notification and badge handler
let chatSocket = io();
let chatUnread = 0;
let chatUsers = {};

// Create global notification container if not present
if (!document.getElementById('globalNotificationContainer')) {
  const notifDiv = document.createElement('div');
  notifDiv.id = 'globalNotificationContainer';
  notifDiv.style.position = 'fixed';
  notifDiv.style.top = '1.5rem';
  notifDiv.style.right = '1.5rem';
  notifDiv.style.zIndex = '3000';
  document.body.appendChild(notifDiv);
}

function updateChatNavbarBadge() {
  let chatNav = document.querySelector('a[href="/chat"]');
  if (!chatNav) return;
  let badge = chatNav.querySelector('.chat-badge');
  if (!badge && chatUnread > 0) {
    badge = document.createElement('span');
    badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger chat-badge';
    badge.style.fontSize = '0.7em';
    chatNav.appendChild(badge);
  }
  if (badge) {
    badge.textContent = chatUnread > 0 ? chatUnread : '';
    badge.style.display = chatUnread > 0 ? '' : 'none';
  }
}

async function fetchChatUnread() {
  const token = localStorage.getItem('token');
  if (!token) return;
  const res = await fetch('/api/messages/unread-counts', { headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    const unreadChats = await res.json();
    chatUnread = Object.values(unreadChats).reduce((a, b) => a + b, 0);
    updateChatNavbarBadge();
  }
}

function showGlobalChatNotification(data) {
  // Optionally fetch user name if not present
  let senderName = data.senderName || 'Someone';
  if (chatUsers[data.sender]) senderName = chatUsers[data.sender].fullName;
  const notif = document.createElement('div');
  notif.className = 'alert alert-success shadow fade show d-flex align-items-center';
  notif.style.minWidth = '280px';
  notif.style.marginBottom = '1rem';
  notif.innerHTML = `
    <i class='bi bi-chat-dots fs-4 me-2'></i>
    <div>
      <b>New message</b> from <span class='text-success'>${senderName}</span>
      <div class='small mt-1 text-dark'>${data.content}</div>
    </div>
    <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  notif.querySelector('.btn-close').onclick = () => notif.remove();
  document.getElementById('globalNotificationContainer').appendChild(notif);
  setTimeout(() => notif.classList.remove('show'), 3500);
  setTimeout(() => notif.remove(), 4000);
}

chatSocket.on('receiveMessage', data => {
  fetchChatUnread();
  showGlobalChatNotification(data);
});

document.addEventListener('DOMContentLoaded', fetchChatUnread);

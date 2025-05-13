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

console.log('[CHAT BADGE] Script loaded');

function getCurrentUserId() {
  // Try localStorage first
  let userId = localStorage.getItem('userId');
  if (userId) return userId;
  // Try to extract from token if not present
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id || payload.userId || payload._id;
      if (userId) {
        localStorage.setItem('userId', userId);
        return userId;
      }
    } catch (e) {
      console.error('[CHAT BADGE] Failed to parse userId from token:', e);
    }
  }
  // Try to get from window/global user object if available
  if (window.user && window.user._id) {
    localStorage.setItem('userId', window.user._id);
    return window.user._id;
  }
  return null;
}

chatSocket.on('connect', () => {
  console.log('[SOCKET][CLIENT][GLOBAL] Connected to socket.io:', chatSocket.id);
  const userId = getCurrentUserId();
  console.log('[SOCKET][CLIENT][GLOBAL] Registering userId:', userId);
  if (userId) chatSocket.emit('register', userId);
});

function updateChatNavbarBadge() {
  let chatNav = document.querySelector('a[href="/chat"]');
  if (!chatNav) {
    console.log('[CHAT BADGE] No chat nav link found');
    return;
  }
  let badge = chatNav.querySelector('.chat-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger chat-badge';
    badge.style.fontSize = '0.7em';
    chatNav.appendChild(badge);
  }
  badge.textContent = chatUnread > 0 ? chatUnread : '';
  badge.style.display = chatUnread > 0 ? 'inline-flex' : 'none';
  console.log('[CHAT BADGE] Badge updated. chatUnread:', chatUnread, 'badge:', badge.textContent);
}

// Reset badge when visiting chat page
if (window.location.pathname.startsWith('/chat')) {
  chatUnread = 0;
  updateChatNavbarBadge();
  // Optionally, you can also call fetchChatUnread() here to sync
}

async function fetchChatUnread() {
  const token = localStorage.getItem('token');
  if (!token) return;
  const res = await fetch('/api/messages/unread-counts', { headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    const unreadChats = await res.json();
    console.log('[CHAT BADGE] API unreadChats:', unreadChats); // Debug log
    chatUnread = Object.values(unreadChats).reduce((a, b) => a + b, 0);
    updateChatNavbarBadge();
  }
}

// Fetch all users and cache for sender name resolution
async function fetchAllChatUsers() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch('/api/users/all', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const users = await res.json();
      users.forEach(u => { chatUsers[u._id] = u; });
      console.log('[CHAT BADGE] Cached users:', chatUsers);
    }
  } catch (e) {
    console.error('[CHAT BADGE] Failed to fetch users:', e);
  }
}

function showGlobalChatNotification(data) {
  // Always resolve sender name from chatUsers
  let senderName = (chatUsers[data.sender] && chatUsers[data.sender].fullName) || data.senderName || 'Someone';
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
  console.log('[SOCKET][CLIENT][GLOBAL] receiveMessage event:', data);
  fetchChatUnread();
  showGlobalChatNotification(data);
});

document.addEventListener('DOMContentLoaded', () => {
  fetchAllChatUsers();
  fetchChatUnread();
});

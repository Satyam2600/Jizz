 const userId = localStorage.getItem('userId') || '<%= user && user._id ? user._id : "" %>';
    let currentChatUser = null;
    let users = [];
    let socket = io();
    let unreadChats = {};
    if (userId) socket.emit('register', userId);

    // Fetch all users
    async function fetchUsers() {
      const res = await fetch('/api/users/all', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      users = await res.json();
      renderUserList();
    }

    // Render user list
    function renderUserList() {
      const userList = document.getElementById('userList');
      userList.innerHTML = '';
      users.forEach(u => {
        if (u._id === userId) return; // Don't show self
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<img src="${u.avatar || '/assets/images/default-avatar.png'}" class="user-avatar"><div><div class="fw-bold">${u.fullName}</div><div class="text-muted small">@${u.username || u.rollNumber}</div></div>`;
        div.onclick = () => selectUser(u);
        if (currentChatUser && currentChatUser._id === u._id) div.classList.add('active');
        // Add unread badge
        if (unreadChats[u._id]) {
          div.innerHTML += `<span class='badge bg-danger ms-2'>${unreadChats[u._id]}</span>`;
        }
        userList.appendChild(div);
      });
    }

    // Select user to chat
    async function selectUser(u) {
      currentChatUser = u;
      unreadChats[u._id] = 0; // Clear unread count
      renderUserList();
      document.getElementById('chatHeader').innerHTML = `<img src="${u.avatar || '/assets/images/default-avatar.png'}" class="user-avatar me-2"><span class="fw-bold">${u.fullName}</span> <span class="text-muted small">@${u.username || u.rollNumber}</span>`;
      document.getElementById('chatInputForm').style.display = '';
      await loadMessages();
      updateChatNavbarBadge();
      await fetchUnreadCounts();
    }

    // Load messages between current user and selected user
    async function loadMessages() {
      if (!currentChatUser) return;
      const res = await fetch(`/api/messages/${currentChatUser._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const messages = await res.json();
      renderMessages(messages);
    }

    // Render messages
    function renderMessages(messages) {
      const chatMessages = document.getElementById('chatMessages');
      chatMessages.innerHTML = '';
      if (!messages.length) {
        chatMessages.innerHTML = '<div class="chat-empty">No messages yet. Say hi!</div>';
        return;
      }
      messages.forEach(m => appendMessageToChat(m));
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Append a single message to chat
    function appendMessageToChat(m) {
      const chatMessages = document.getElementById('chatMessages');
      const isSent = m.sender === userId;
      const div = document.createElement('div');
      div.className = 'message' + (isSent ? ' sent' : ' received');
      div.innerHTML = `
        <div class="msg-bubble ${isSent ? 'sent' : 'received'}">
          <div>${m.content}</div>
          <div class="msg-time">${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      `;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message
    document.getElementById('chatInputForm').onsubmit = async function(e) {
      e.preventDefault();
      const input = document.getElementById('chatInput');
      const content = input.value.trim();
      if (!content || !currentChatUser) return;
      // Send via API for persistence
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ receiver: currentChatUser._id, content })
      });
      // Emit via socket for real-time
      const msgObj = { sender: userId, receiver: currentChatUser._id, content, createdAt: new Date() };
      appendMessageToChat(msgObj); // Optimistic UI (only sender)
      socket.emit('sendMessage', msgObj);
      input.value = '';
    };

    // Fetch unread message counts and update badges
    async function fetchUnreadCounts() {
      const res = await fetch('/api/messages/unread-counts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        unreadChats = await res.json();
        renderUserList();
        updateChatNavbarBadge();
      }
    }

    // Call on page load
    fetchUnreadCounts();

    // Listen for real-time messages
    socket.on('receiveMessage', data => {
      console.log('[SOCKET][CLIENT] receiveMessage event:', data);
      // Only append if the message is from the other user (not self)
      if (data.sender !== userId && currentChatUser && (data.sender === currentChatUser._id || data.receiver === currentChatUser._id)) {
        appendMessageToChat(data);
        fetchUnreadCounts();
      } else if (data.sender !== userId) {
        // Otherwise, increment unread count and show notification
        unreadChats[data.sender] = (unreadChats[data.sender] || 0) + 1;
        renderUserList();
        showChatNotification(data);
        updateChatNavbarBadge();
        // Emit a custom event for global badge update
        window.dispatchEvent(new CustomEvent('chat-unread-update'));
      }
    });

    // Show chat notification (improved UI)
    function showChatNotification(data) {
      let notif = document.createElement('div');
      notif.className = 'alert alert-success shadow position-fixed top-0 end-0 m-4 fade show';
      notif.style.zIndex = 2000;
      notif.style.minWidth = '280px';
      notif.innerHTML = `<div class='d-flex align-items-center'><i class='bi bi-chat-dots fs-4 me-2'></i><div><b>New message</b> from <span class='text-success'>${users.find(u => u._id === data.sender)?.fullName || 'Someone'}</span><div class='small mt-1 text-dark'>${data.content}</div></div></div>`;
      document.body.appendChild(notif);
      setTimeout(() => notif.classList.remove('show'), 3500);
      setTimeout(() => notif.remove(), 4000);
    }

    // Update chat icon badge in navbar (and globally)
    function updateChatNavbarBadge() {
      let totalUnread = Object.values(unreadChats).reduce((a, b) => a + b, 0);
      let chatNav = document.querySelector('a[href="/chat"]');
      if (!chatNav) return;
      let badge = chatNav.querySelector('.chat-badge');
      if (!badge && totalUnread > 0) {
        badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger chat-badge';
        badge.style.fontSize = '0.7em';
        chatNav.appendChild(badge);
      }
      if (badge) {
        badge.textContent = totalUnread > 0 ? totalUnread : '';
        badge.style.display = totalUnread > 0 ? '' : 'none';
      }
      // Also update global badge if present
      window.dispatchEvent(new CustomEvent('chat-unread-update'));
    }

    fetchUsers();

    // Theme toggle logic (copied from dashboard)
    document.addEventListener("DOMContentLoaded", function () {
      const themeToggle = document.getElementById("themeToggle");
      const themeIcon = themeToggle.querySelector("i");
      const savedTheme = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-bs-theme", savedTheme);
      updateThemeIcon(savedTheme);
      themeToggle.addEventListener("click", function () {
        const currentTheme = document.documentElement.getAttribute("data-bs-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-bs-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
      });
      function updateThemeIcon(theme) {
        if (theme === "dark") {
          themeIcon.classList.remove("bi-moon");
          themeIcon.classList.add("bi-sun");
        } else {
          themeIcon.classList.remove("bi-sun");
          themeIcon.classList.add("bi-moon");
        }
      }
    });
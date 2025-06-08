  const userId = localStorage.getItem('userId') || '<%= user && user._id ? user._id : "" %>';
      const socket = window.io ? io() : null;
      let unreadCount = 0;

      function updateNotificationBell() {
        const badge = document.getElementById('notificationBadge');
        badge.textContent = unreadCount;
        badge.classList.toggle('d-none', unreadCount === 0);
      }

      async function fetchNotifications() {
        try {
          const res = await fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
          if (!res.ok) return;
          const notifications = await res.json();
          unreadCount = notifications.filter(n => !n.isRead).length;
          updateNotificationBell();
        } catch {}
      }

      if (socket && userId) {
        socket.emit('register', userId);
        socket.on('notification', function(notification) {
          fetchNotifications();
        });
      }
      fetchNotifications();

      window.addEventListener('notifications-read', function() {
        unreadCount = 0;
        updateNotificationBell();
      });
  
      document.addEventListener("DOMContentLoaded", function () {
        // Get theme toggle button
        const themeToggle = document.getElementById("themeToggle");
        const themeIcon = themeToggle.querySelector("i");

        // Check for saved theme preference or use default light theme
        const savedTheme = localStorage.getItem("theme") || "light";
        document.documentElement.setAttribute("data-bs-theme", savedTheme);

        // Update icon based on current theme
        updateThemeIcon(savedTheme);

        // Add click event to theme toggle button
        themeToggle.addEventListener("click", function () {
          const currentTheme =
            document.documentElement.getAttribute("data-bs-theme");
          const newTheme = currentTheme === "dark" ? "light" : "dark";

          // Update theme
          document.documentElement.setAttribute("data-bs-theme", newTheme);
          localStorage.setItem("theme", newTheme);

          // Update icon
          updateThemeIcon(newTheme);

          // Force repaint for background, post cards, and sidebar on theme toggle
          document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg');
          document.querySelectorAll('.post-card').forEach(card => {
            card.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg');
            card.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
            card.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
          });
          document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg');
            sidebar.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
          });
          document.querySelectorAll('.card, .card-body').forEach(card => {
            card.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg');
            card.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
            card.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
          });
          document.querySelectorAll('.navbar .nav-link, .navbar .navbar-brand, .navbar .dropdown > a, .navbar .btn.position-relative').forEach(el => {
            el.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
          });
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

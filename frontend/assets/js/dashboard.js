// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-bs-theme') === 'dark';
    document.body.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
});

// Mobile Sidebar Toggle
document.querySelector('.navbar-toggler').addEventListener('click', () => {
    document.querySelectorAll('.sidebar').forEach(sidebar => {
        sidebar.classList.toggle('active');
    });
});


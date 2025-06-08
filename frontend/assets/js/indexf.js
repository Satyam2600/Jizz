// Theme toggle logic
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    function setTheme(dark) {
      document.body.classList.toggle('dark-mode', dark);
      themeIcon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }

    // Initial theme
    setTheme(storedTheme === 'dark' || (!storedTheme && prefersDark));

    themeToggle.addEventListener('click', () => {
      setTheme(!document.body.classList.contains('dark-mode'));
    });
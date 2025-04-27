async function login(event) {
    event.preventDefault();
    console.log('Login attempt started');

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log('Login attempt for email:', email);

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);

        if (response.ok) {
            console.log('Login successful, setting token');
            setToken(data.token);
            window.location.href = "/communities.html";
        } else {
            console.error('Login failed:', data.error);
            showError(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError("An error occurred. Please try again.");
    }
} 
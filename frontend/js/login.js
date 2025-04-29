async function login(event) {
    event.preventDefault();
    console.log('Login attempt started');

    const rollNumber = document.getElementById("rollNumber").value;
    const password = document.getElementById("password").value;
    console.log('Login attempt for rollNumber:', rollNumber);

    try {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ rollNumber, password }),
            credentials: "include"
        });

        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);

        if (response.ok) {
            // Session-based login: no need to store token
            window.location.href = "/dashboard";
        } else {
            console.error('Login failed:', data.message || data.error);
            alert(data.message || data.error || "Login failed");
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("An error occurred. Please try again.");
    }
}
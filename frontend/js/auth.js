import jwtDecode from 'jwt-decode';

export function isAuthenticated() {
    console.log('Checking authentication status');
    const token = localStorage.getItem("token");
    console.log('Token in isAuthenticated:', token ? 'Present' : 'Not present');
    
    if (!token) {
        console.log('No token found in localStorage');
        return false;
    }
    
    try {
        console.log('Attempting to decode token:', token);
        const decoded = jwtDecode(token);
        console.log('Token decoded successfully:', decoded);
        console.log('Token expiration:', new Date(decoded.exp * 1000));
        console.log('Current time:', new Date());
        
        if (decoded.exp * 1000 < Date.now()) {
            console.log('Token has expired');
            localStorage.removeItem("token");
            return false;
        }
        
        console.log('Token is valid and not expired');
        return true;
    } catch (error) {
        console.error('Error decoding token:', error);
        console.error('Token that caused error:', token);
        localStorage.removeItem("token");
        return false;
    }
}

function getToken() {
    const token = localStorage.getItem("token");
    console.log('Getting token - Token exists:', !!token);
    return token;
}

function setToken(token) {
    console.log('Setting token in localStorage');
    localStorage.setItem("token", token);
}

function clearToken() {
    console.log('Clearing token from localStorage');
    localStorage.removeItem("token");
} 
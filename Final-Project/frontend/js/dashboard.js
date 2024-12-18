// Simulate fetching user data from JWT
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Unauthorized! Redirecting to login...");
        window.location.href = "index.html";
    }

   fetchUserData(token);
});

// Fetch user information
async function fetchUserData(token) {
    try {
        const response = await fetch('http://localhost:3030/api/auth/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok) {
            document.getElementById("user-name").innerText = `Hello, ${data.name}!`;
        } else {
            alert("Session expired. Please log in again.");
            logout();
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        logout();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = "index.html";
}

// Placeholder navigation functions
function goToNotes() {
    //alert("Navigating to Notes...");
    window.location.href = "note.html";
}

function goToProfile() {
    //alert("Navigating to Profile...");
    window.location.href = "draw.html";
}

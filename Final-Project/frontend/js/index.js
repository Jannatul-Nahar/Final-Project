// Function to toggle between login and signup forms
function showLogin() {
    document.getElementById("login-form").classList.add("active");
    document.getElementById("signup-form").classList.remove("active");
    document.getElementById("login-btn").classList.add("active");
    document.getElementById("signup-btn").classList.remove("active");
}

function showSignup() {
    document.getElementById("signup-form").classList.add("active");
    document.getElementById("login-form").classList.remove("active");
    document.getElementById("signup-btn").classList.add("active");
    document.getElementById("login-btn").classList.remove("active");
}


async function register() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    console.log(name, email, password);

    const response = await fetch('http://localhost:3030/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    alert(data.message);
    showLogin();
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch('http://localhost:3030/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.token) {
        // alert("Login Successful! Token: " + data.token);
        // Save the token in local storage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        window.location.href = "dashboard.html";
    } else {
        alert(data.message);
    }
}

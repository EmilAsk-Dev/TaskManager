document.addEventListener('DOMContentLoaded', function() {
    console.log('Login is running');

    const username = document.getElementById('Username');
    const password = document.getElementById('Password');
    const loginButton = document.getElementById('loginButton');

    loginButton.addEventListener('click', function() {
        const loginData = {
            username: username.value,
            password: password.value
        };

        // Send a POST request to /login to authenticate the user
        fetch('/auth/login', {  // Adjusted to use /login route
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())  
        .then(data => {
            if (data.success) {                
                window.location.href = '/dashboard';  // Redirect to dashboard on success
            } else {
                alert('Login failed: ' + data.message);  // Show failure message
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

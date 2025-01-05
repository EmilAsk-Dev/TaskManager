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

        fetch('/Login', {
            method: 'POST', // Ensure the method is POST
            headers: {
                'Content-Type': 'application/json' // Send JSON data
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())  // Expecting JSON response
        .then(data => {
            if (data.success) {                
                window.location.href = '/Dashboard'; // Redirect to a protected page
            } else {
                alert('Login failed: ' + data.message); // Show error message
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

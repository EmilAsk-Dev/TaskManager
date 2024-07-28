document.addEventListener('DOMContentLoaded', function() {
    console.log('Login is running');

    const username = document.getElementById('Username');
    const password = document.getElementById('Password');
    const loginButton = document.getElementById('loginButton');
    const gotoCreateUser = document.getElementById('gotoCreateUser');

    loginButton.addEventListener('click', function() {
        const loginData = {
            username: username.value,
            password: password.value
        };

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {                
                window.location.href = '/'; // Redirect to a protected page
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    gotoCreateUser.addEventListener('click', function() {
        window.location.href = '/CreateUser';
    });
    const numBubbles = 30; // Number of bubbles to create
    const bubbleContainer = document.querySelector('.bubble-container');

    for (let i = 0; i < numBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = `${Math.random() * 100}vw`; // Random horizontal position
        bubble.style.animationDuration = `${Math.random() * 6 + 4}s`; // Random animation duration between 4-10 seconds
        bubbleContainer.appendChild(bubble);
    }
});

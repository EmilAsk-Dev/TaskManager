document.addEventListener('DOMContentLoaded', function() {
    const createUserForm = document.getElementById('createUserForm');
    createUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('Username').value;
        const password = document.getElementById('Password').value;
        
        const userData = {
            username: username,
            password: password,
            isAdmin: false
        };
        
        fetch('/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Failed to create user. Please try again.', 'error');
        });
    });
    
    function showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = type;
        messageElement.style.display = 'block';
    }
    
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

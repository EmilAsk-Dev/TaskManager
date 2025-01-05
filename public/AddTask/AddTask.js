document.addEventListener('DOMContentLoaded', function() {
    const addTaskForm = document.getElementById('addTaskForm');    
    addTaskForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const taskData = {
            name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value
        };

        try {
            const response = await fetch('/add-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            const result = await response.json();
            if (result.success) {
                alert('Task added successfully');
                addTaskForm.reset(); // Reset the form after successful submission
            } else {
                alert('Failed to add task: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding task');
        }
    });
    
    const goToTaskButton = document.getElementById('SeeTask');
    goToTaskButton.addEventListener('click', function() {
        window.location.href = '/task'; // Navigate to /tasks when button is clicked
    });
});

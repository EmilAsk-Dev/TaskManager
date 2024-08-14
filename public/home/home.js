document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the highest priority task
        const highestPrioResponse = await fetch('/highest-prio-task');
        const highestPrioTask = await highestPrioResponse.json();

        if (highestPrioTask.length > 0) {
            const taskElement = document.getElementById('highest-prio-task');
            taskElement.innerHTML = ''; // Clear previous content
            highestPrioTask.forEach(prio => {
                // Log each task to check its properties
                console.log(prio);

                // Access the correct property for task name
                const taskText = prio.name; // Customize this line if property name is different
                
                // Create a new element for each task and append it to the taskElement
                const taskItem = document.createElement('div');
                taskItem.className = 'task-card'; // Add the CSS class for task card
                taskItem.innerText = taskText;
                taskElement.appendChild(taskItem);

                console.log(prio.name); // Log the task name to the console
            });
        } else {
            
            console.log('No high priority tasks found.');
        }
    } catch (error) {
        console.error('Error fetching highest priority tasks:', error);
    }
});

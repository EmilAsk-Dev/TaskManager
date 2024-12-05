document.addEventListener('DOMContentLoaded', function() {
    console.log('AdminPage is running');    

    let globalUsername; // Declare a global variable to store the selected user's username

    // Fetch and display users
    async function fetchAndDisplayUsers() {
        try {
            const response = await fetch('/Users');
            if (!response.ok) throw new Error('Failed to fetch users');
    
            const users = await response.json();
            updateUserTable(users);
        } catch (error) {
            console.error('Error fetching users:', error.message);
        }
    }
    
    // Update the user table with fetched users
    function updateUserTable(users) {
        const userTableBody = document.querySelector('.TableAdmin tbody');
        if (!userTableBody) return;
    
        userTableBody.innerHTML = ''; // Clear existing rows
    
        users.forEach(user => {
            const userRow = createUserRow(user);
            userTableBody.appendChild(userRow);
        });
    }
    
    // Create a row for each user
    function createUserRow(user) {
        const row = document.createElement('tr');
        row.className = 'Body-table';
        
        const idCell = createTableCell(user.id, 'Table-info');
        const usernameCell = createTableCell(user.username, 'Table-info');
        const passwordCell = createTableCell(user.password, 'Table-info');
        const gmailCell = createTableCell(user.gmail, 'Table-info');
        const isAdminCell = createTableCell(user.isAdmin ? 'Yes' : 'No', 'Table-info');
        
        row.appendChild(idCell);
        row.appendChild(usernameCell);
        row.appendChild(passwordCell);
        row.appendChild(gmailCell);
        row.appendChild(isAdminCell);
        
        // Add event listener to show user tasks when clicked
        row.addEventListener('click', () => showUserDetails(user));

        return row;
    }
    
    // Helper function to create table cells
    function createTableCell(content, className) {
        const cell = document.createElement('td');
        cell.className = className;
        cell.textContent = content;
        return cell;
    }

    // Show details of a selected user
    function showUserDetails(user) {
        console.log('User details:', user);
        globalUsername = user.username; // Store the username globally
        fetchAndDisplayTasks(globalUsername); // Pass username to fetch tasks
    }

    // Fetch and display tasks for a specific user
    async function fetchAndDisplayTasks(username) {
        try {
            const response = await fetch(`/checkuser?username=${username}`); // Send username as a query parameter
            if (!response.ok) throw new Error('Failed to fetch tasks');
            
            const tasks = await response.json();
            updateTaskLists(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
        }
    }
    
    // Update the task list with fetched tasks
    function updateTaskLists(tasks) {
        const taskListContainer = document.querySelector('#completed-task-list');
        if (!taskListContainer) return;

        taskListContainer.innerHTML = ''; // Clear existing tasks

        tasks.forEach(task => {
            const taskElement = createTaskElement(task, globalUsername);
            taskListContainer.appendChild(taskElement);
        });
    }
    
    // Create an element for each task
    function createTaskElement(task, username) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="taskCheckbox_${task.id}" name="taskCheckbox" data-task-id="${task.id}" ${task.status ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <h3>${task.name}</h3>
                <p>Description: ${task.description}</p>
                <p>Due: ${task.dueDate}</p>
                <p>Priority: ${task.priority} Level</p>
                <p>Category: ${task.category ? task.category.name : 'Uncategorized'}</p>
                <p data-username="${username}">Username: ${username}</p>
            </div>
        `;
        return taskElement;
    }
    
    
    

    // Initial call to fetch and display users
    fetchAndDisplayUsers();
});

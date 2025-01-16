const favorites = [
    { name: "Marketing Campaign", type: "Board" },
    { name: "Design System", type: "Board" },
    { name: "Product Roadmap", type: "Board" }
];


// Populate dynamic content
function populateFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favorites.forEach(favorite => {
        const item = document.createElement('li');
        item.className = 'dropdown-item';
        item.textContent = favorite.name;
        favoritesList.appendChild(item);
    });
}


async function populateWorkspaces() {
    
    const res = await fetch('/api/v1/namespaces')
    const workspaces = await res.json()

    const workspacesList = document.getElementById('workspaces-list');
    workspaces.forEach(workspace => {
        const item = document.createElement('li');
        item.className = 'workspace-item';
        item.innerHTML = `
        
            <span class="workspace-icon">${workspace.icon}</span>
            <div class="workspace-info">
                <span class="workspace-name">${workspace.name}</span>
                <span class="workspace-type">${workspace.type}</span>
            </div>
        
        `;
        workspacesList.appendChild(item);
    });
}

// Initialize dropdowns
function initializeDropdowns() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const header = item.querySelector('.nav-header');
        
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // If I want to only be able to open one dropdown
            // navItems.forEach(otherItem => {
            //     if (otherItem !== item) {
            //         otherItem.classList.remove('active');
            //     }
            // });
            
            // Toggle current dropdown
            item.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        navItems.forEach(item => item.classList.remove('active'));
    });

    // Prevent dropdown close when clicking inside
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// Add click handlers for items
function initializeClickHandlers() {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log(`Selected item: ${item.textContent}`);
            // Add your selection logic here
        });
    });

    document.querySelectorAll('.workspace-item').forEach(item => {
        item.addEventListener('click', () => {
            const workspaceName = item.querySelector('.workspace-name').textContent;
            console.log(`Selected workspace: ${workspaceName}`);
            // Add your workspace selection logic here
        });
    });
}

// Initialize the app
async function initializeApp() {
    const tabsContainer = document.getElementById('tabs-container');

    // Clear the container before initializing
    tabsContainer.innerHTML = '';

    try {
        // Fetch task data (mock or API call)
        const response = await fetch('/Api/v1/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch task data');
        }
        const taskData = await response.json();

        // Create tab sections for each key in taskData
        await Promise.all(
            Object.keys(taskData).map(async (tabName) => {
                await createTabSection(tabName, tabsContainer, taskData[tabName]);
            })
        );
    } catch (error) {
        console.error('Error initializing app:', error);
        tabsContainer.innerHTML = '<p class="error">Failed to load tasks. Please try again later.</p>';
    }
}

async function GetTasks(index = 0) {
    try {
        const response = await fetch('/Api/v1/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        console.log(tasks); // Debug fetched tasks
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.style.animationDelay = `${index * 0.1}s`;
        taskElement.innerHTML = `
            <div class="checkbox"></div>
            <div class="taskname">${tasks.name || 'Unnamed Task'}</div>
            <div class="owneruser">👤</div>
            <div class="status ${tasks.status ? tasks.status.toLowerCase().replace(/\s/g, '') : ''}">${tasks.status || 'Unknown'}</div>
            <div class="datetask">${tasks.date || 'No Date'}</div>
            <div class="priority ${tasks.priority ? tasks.priority.toLowerCase() : 'medium'}">${tasks.priority || 'Medium'}</div>
            <div class="time-est">${tasks.timeEst || '0h'}</div>
        `;
        return taskElement;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}


// Create a tab section dynamically
async function createTabSection(tabName, container) {
    const section = document.createElement('div');
    section.className = 'tab-section';

    // Create tab header
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.innerHTML = `
        <span class="tab-icon">▼</span>
        <span>${tabName}</span>
    `;

    // Create content container
    const content = document.createElement('div');
    content.className = 'tab-content';

    // Add column headers
    const headers = document.createElement('div');
    headers.className = 'column-headers';
    headers.innerHTML = `
        <div class="DoneHeader">Done</div>
        <div class="taskname">Task Name</div>
        <div class="owneruser">Owner</div>
        <div class="statustask">Status</div>
        <div class="datetask">Date</div>
        <div class="prioritytask">Priority</div>
        <div class="createdat">Time Est.</div>
    `;
    content.appendChild(headers);

    // Fetch tasks and add them to the list
    const taskList = document.createElement('div');
    taskList.className = 'task-list';
    let tasks = [];

    try {
        const response = await fetch('/Api/v1/tasks');
        if (!response.ok) throw new Error(`Failed to fetch tasks for ${tabName}`);
        const data = await response.json();
        tasks = data[tabName] || [];
    } catch (error) {
        console.error(`Error fetching tasks for ${tabName}:`, error);
    }

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        if (taskElement) taskList.appendChild(taskElement);
    });

    // Add "+ Add" button
    const addTask = document.createElement('div');
    addTask.className = 'task-item add-task';
    addTask.innerHTML = '+ Add';
    addTask.onclick = () => addNewTask(tabName);
    taskList.appendChild(addTask);

    // Add summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    const totalTime = tasks.reduce((sum, task) => {
        const time = parseFloat(task.timeEst?.replace('h', '') || '0');
        return sum + time;
    }, 0);
    summary.textContent = `${totalTime}h sum`;

    content.appendChild(taskList);
    content.appendChild(summary);

    // Toggle functionality
    tab.onclick = () => {
        tab.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        const icon = tab.querySelector('.tab-icon');
        icon.style.transform = tab.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0)';
    };

    section.appendChild(tab);
    section.appendChild(content);
    container.appendChild(section);
}





// Create task element
// Helper function to create a task element
function createTaskElement(task = {}, index = 0) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.style.animationDelay = `${index * 0.1}s`;
    taskElement.innerHTML = `
        <div class="checkbox"></div>
        <div class="taskname">${task.name || 'Unnamed Task'}</div>
        <div class="owneruser">👤</div>
        <div class="status ${task.status?.toLowerCase()?.replace(/\s/g, '') || ''}">${task.status || 'Unknown'}</div>
        <div class="datetask">${task.date || 'No Date'}</div>
        <div class="priority ${task.priority?.toLowerCase() || 'medium'}">${task.priority || 'Medium'}</div>
        <div class="time-est">${task.timeEst || '0h'}</div>
    `;
    return taskElement;
}

// Add new task dynamically
function addNewTask(tabName) {
    const newTask = {
        id: Date.now(),
        name: `Task ${taskData[tabName]?.length + 1 || 1}`,
        status: '',
        date: '',
        priority: 'Medium',
        timeEst: '0h'
    };
    if (!taskData[tabName]) taskData[tabName] = [];
    taskData[tabName].push(newTask);

    // Refresh tabs
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    Object.keys(taskData).forEach((name) => createTabSection(name, container));
}

// Add new task
function addNewTask(tabName) {
    const newTask = {
        id: Math.max(...Object.values(taskData).flat().map(t => t.id)) + 1,
        name: `Task ${taskData[tabName].length + 1}`,
        status: '',
        date: '',
        priority: 'Medium',
        timeEst: '0h'
    };
    taskData[tabName].push(newTask);
    // Refresh the entire section
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    Object.keys(taskData).forEach((tabName) => {
        createTabSection(tabName, container);
    });
}

// Initialize the app when the page loads

initializeApp();

(async ()=>{
    populateFavorites();
    await populateWorkspaces();
    initializeDropdowns();
    initializeClickHandlers();
    await GetTasks()
    //displayRecentlyVisited();
    
})()


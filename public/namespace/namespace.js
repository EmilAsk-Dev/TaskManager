// Sample data structure
const taskData = {
    'This Week': [
        { id: 1, name: 'Task 1', status: 'Working on it', date: 'Mar 8', priority: 'High', timeEst: '2h' },
        { id: 2, name: 'Task 2', status: 'Working on it', date: 'Mar 14', priority: 'High', timeEst: '5h' },
        { id: 3, name: 'Task 3', status: 'Waiting for review', date: 'Mar 21', priority: 'Medium', timeEst: '2.5h' },
        { id: 4, name: 'Task 4', status: '', date: 'Mar 29', priority: 'Medium', timeEst: '7h' }
    ],
    'Next Week': [
        { id: 5, name: 'Task 5', status: '', date: '', priority: 'High', timeEst: '2h' }
    ]
};

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
    Object.keys(taskData).forEach((tabName, index) => {
        createTabSection(tabName, tabsContainer);
    });
}

// Create tab section
function createTabSection(tabName, container) {
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
        <div></div>
        <div>Task Name</div>
        <div>Owner</div>
        <div>Status</div>
        <div>Date</div>
        <div>Priority</div>
        <div>Time Est.</div>
    `;
    content.appendChild(headers);

    // Add task list
    const taskList = document.createElement('div');
    taskList.className = 'task-list';
    
    taskData[tabName].forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        taskList.appendChild(taskElement);
    });

    // Add the "+ Add" button
    const addTask = document.createElement('div');
    addTask.className = 'task-item add-task';
    addTask.innerHTML = '+ Add';
    addTask.onclick = () => addNewTask(tabName);
    taskList.appendChild(addTask);

    // Add summary
    const summary = document.createElement('div');
    summary.className = 'summary';
    const totalTime = taskData[tabName].reduce((sum, task) => {
        return sum + parseFloat(task.timeEst);
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

// Create task element (keeping the same implementation)
function createTaskElement(task, index) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.style.animationDelay = `${index * 0.1}s`;
    taskElement.innerHTML = `
        <div class="checkbox"></div>
        <div>${task.name}</div>
        <div>👤</div>
        <div class="status ${task.status.toLowerCase().replace(/\s/g, '')}">${task.status || ''}</div>
        <div>${task.date}</div>
        <div class="priority ${task.priority.toLowerCase()}">${task.priority}</div>
        <div>${task.timeEst}</div>
    `;
    return taskElement;
}

// Add new task (keeping the same implementation)
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
    displayRecentlyVisited();
    
})()
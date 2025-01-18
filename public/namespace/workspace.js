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
    tabsContainer.innerHTML = ''; // Clear container before initialization

    try {
        // Fetch task data (mock or API call)
        const response = await fetch('/Api/v1/tasks');
        if (!response.ok) throw new Error('Failed to fetch task data');
        
        const taskData = await response.json();
        
        
        // Create task elements
        taskData.forEach((task, index) => {       
            
            const week = getWeek(new Date(task.date))
            let container = tabsContainer.querySelector(`.tab-section-${week}`)
            if(!container){
                container = createTabSection(`week ${week}`, tabsContainer, [], week)
            }

            const taskList = container.querySelector('.task-list') 

            const taskElement = createTaskElement(task, index);
            taskList.insertBefore(taskElement, taskList.lastElementChild);
        });
        
        // await Promise.all(
        //     Object.keys(taskData).map(async (tabName) => {
        //         await createTabSection(tabName, tabsContainer, taskData[tabName]);
        //     })
        // );
        
    } catch (error) {
        console.error('Error initializing app:', error);
        tabsContainer.innerHTML = '<p class="error">Failed to load tasks. Please try again later.</p>';
    }
}

async function AddTaskToTab() {

    const taskName = document.getElementById('taskName').value.trim();
    const date = document.getElementById('date').value.trim();
    const priority = document.getElementById('priority').value.trim();
    const timeEst = document.getElementById('timeEst').value.trim();

    


    if (!taskName || !date || !priority || !timeEst) {
        alert('Please fill all fields!');
        return;
    }
    
    var week = getWeek(new Date(date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compare the selected date with today's date
    if (new Date(date) < today) {
        alert('PastDate');
        return
    } 
        
    const Task = {
        name: taskName,
        status: 'Pending',
        date,
        priority,
        timeEst
    };

    const tabsContainer = document.getElementById('tabs-container');
    console.log(tabsContainer)
    
    let container = tabsContainer.querySelector(`.tab-section-${week}`);
    if (!container) {
        console.log("No container found, creating new one...");
        container = createTabSection(`week ${week}`, tabsContainer, [], week);
        console.log(container); // Ensure it returns a new element
    }
    
    console.log(container)

    const taskList = container.querySelector('.task-list');
    console.log(taskList)
    

    
    
    const taskElement = await GetTasks(taskList.children.length, Task);
    taskList.insertBefore(taskElement, taskList.lastElementChild);


    // Refresh summary if needed
    const summary = taskList.querySelector('.summary');
    if (summary) {
        const totalTime = Array.from(taskList.children)
            .filter(child => child.classList.contains('task-item'))
            .reduce((sum, taskElement) => {
                const timeEst = taskElement.querySelector('.time-est')?.textContent || '0h';
                const time = parseFloat(timeEst.replace('h', '')) || 0;
                return sum + time;
            }, 0);
        summary.textContent = `${totalTime}h sum`;
    }

    hideModal(); // Hide the modal after saving the task
}

function getWeek(date = new Date()) {
    
    const currentDate = new Date(date.getTime())
    currentDate.setDate(currentDate.getDate() + (4 - (currentDate.getDay() || 7)))
    const yearStart = new Date(currentDate.getFullYear(), 0, 1)
    const weekNumber = Math.ceil(((currentDate - yearStart) / 86400000 + 1) / 7)
  
    return weekNumber
  }

  async function GetTasks(index = 0, taskData = {}) {
    try {
        const response = await fetch('/Api/v1/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        
        // Use the task data passed from AddTaskToTab if available
        const task = taskData || tasks[0] || {};  // Use passed data or the first fetched task

        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.style.animationDelay = `${index * 0.1}s`;
        taskElement.innerHTML = `
            <div class="checkbox"></div>
            <div class="taskname">${task.name || 'Unnamed Task'}</div>
            <div class="owneruser">👤</div>
            <div class="status ${task.status ? task.status.toLowerCase().replace(/\s/g, '') : ''}">${task.status || 'Unknown'}</div>
            <div class="datetask">${task.date || 'No Date'}</div>
            <div class="priority ${task.priority ? task.priority.toLowerCase() : 'medium'}">${task.priority || 'Medium'}</div>
            <div class="time-est">${task.timeEst || '0h'}</div>
        `;
        return taskElement;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}

// Create a tab section dynamically
function createTabSection(tabName, container, tasks = [], week) {
    const section = document.createElement('div');
    section.className = `tab-section tab-section-${week}`;
    console.log(tasks)


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

    // Add column 
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
    
    // Add task list
    const taskList = document.createElement('div');
    taskList.className = 'task-list';

    // Create task elements
    tasks.forEach((task, index) => {        
        const taskElement = createTaskElement(task, index);
        taskList.appendChild(taskElement);
    });

    const summary = document.createElement('div');
    summary.className = 'summary';
    const totalTime = tasks.reduce((sum, task) => {
        const time = parseFloat(task.timeEst.replace('h', '')) || 0;
        return sum + time;
    }, 0);
    summary.textContent = `${totalTime}h sum`;

    content.appendChild(taskList);
    content.appendChild(summary);

    // Toggle
    tab.onclick = () => {
        tab.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        const icon = tab.querySelector('.tab-icon');
        icon.style.transform = tab.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0)';
    };

    section.appendChild(tab);
    section.appendChild(content);
    container.appendChild(section);

    return section;
}

function createTaskElement(task = {}, index = 0) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.style.animationDelay = `${index * 0.1}s`;
    taskElement.innerHTML = `
        <div class="task-checkbox"></div>
        <div class="task-name">${task.name || 'Unnamed Task'}</div>
        <div class="task-owner">👤</div>
        <div class="task-status ${task.status?.toLowerCase()?.replace(/\s/g, '') || ''}">${task.status || 'Unknown'}</div>
        <div class="task-date">${task.date || 'No Date'}</div>
        <div class="task-priority ${task.priority?.toLowerCase() || 'medium'}">${task.priority || 'Medium'}</div>
        <div class="task-time">${task.timeEst || '0h'}</div>
    `;

    taskElement.addEventListener('click', () => {
        showTaskModal(task);
    });

    return taskElement;
}

function showTaskModal(task) {
    const modal = document.getElementById('task-modal');
    modal.classList.add('active');

    document.getElementById('task-modal-name').textContent = task.name || 'Unnamed Task';
    document.getElementById('task-modal-status').textContent = task.status || 'Unknown';
    document.getElementById('task-modal-owner').textContent = '👤';
    document.getElementById('task-modal-date').textContent = task.date || 'No Date';
    document.getElementById('task-modal-priority').textContent = task.priority || 'Medium';
    document.getElementById('task-modal-time').textContent = task.timeEst || '0h';
}

// Close Modal
document.getElementById('close-task-modal').addEventListener('click', () => {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('active');
});

// Close modal on clicking outside the content
document.getElementById('task-modal').addEventListener('click', (event) => {
    if (event.target === document.getElementById('task-modal')) {
        document.getElementById('task-modal').classList.remove('active');
    }
});

function updateSummary(taskList) {
    const summary = taskList.querySelector('.summary');
    if (summary) {
        const totalTime = Array.from(taskList.children)
            .filter(child => child.classList.contains('task-item'))
            .reduce((sum, taskElement) => {
                const timeEst = taskElement.querySelector('.time-est')?.textContent || '0h';
                const time = parseFloat(timeEst.replace('h', '')) || 0;
                return sum + time;
            }, 0);
        summary.textContent = `${totalTime}h sum`;
    }
}



const modal = document.getElementById('taskModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');
const openModalBtn = document.getElementById('openModalBtn'); // Added button
const taskForm = document.getElementById('taskForm');

// Show modal
function showModal() {
  modal.classList.remove('hidden');
  modalBackdrop.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Hide modal
function hideModal() {
  modal.classList.add('hidden');
  modalBackdrop.classList.add('hidden');
  document.body.style.overflow = 'auto'; // Restore scrolling
  taskForm.reset();
}

// Event listeners

// openModalBtn.addEventListener('click', showModal); // Open modal
modalBackdrop.addEventListener('click', hideModal); // Close modal by clicking backdrop
cancelTaskBtn.addEventListener('click', hideModal); // Close modal by clicking cancel

saveTaskBtn.addEventListener('click', AddTaskToTab);

// Save task
saveTaskBtn.addEventListener('click', () => {
  const taskName = document.getElementById('taskName').value.trim();
  const date = document.getElementById('date').value.trim();
  const priority = document.getElementById('priority').value.trim();
  const timeEst = document.getElementById('timeEst').value.trim();

  if (!taskName || !date || !priority || !timeEst) {
    alert('Please fill all fields!');
    return;
  }

  const newTask = {
    name: taskName,
    date,
    priority,
    timeEst,
  };

  console.log('New Task:', newTask);

  hideModal();
});

// Get elements
const newItemBtn = document.querySelector('.new-item-btn');
const taskOptionsModal = document.getElementById('taskOptionsModal');
const closeBtn = document.querySelector('.task-modal-close-btn');
const taskOptionButtons = document.querySelectorAll('.task-option-btn');

// Show modal
newItemBtn.addEventListener('click', () => {
    taskOptionsModal.classList.remove('task-modal-hidden');
    taskOptionsModal.style.display = 'flex'; // Ensure it's visible
});

// Close modal when clicking on the close button
closeBtn.addEventListener('click', () => {
    taskOptionsModal.classList.add('task-modal-hidden');
    taskOptionsModal.style.display = 'none'; // Hide the modal explicitly
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === taskOptionsModal) {
        taskOptionsModal.classList.add('task-modal-hidden');
        taskOptionsModal.style.display = 'none'; // Hide the modal explicitly
    }
});

// Handle task option selection
taskOptionButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const taskType = event.target.dataset.taskType;

        console.log(`Selected Task Type: ${taskType}`);

        // Optionally: Open a specific modal or handle logic for the selected task type
        // For now, just close the modal
        taskOptionsModal.classList.add('task-modal-hidden');
        taskOptionsModal.style.display = 'none'; // Ensure modal is hidden after selection

        // Example: Trigger different behavior for each task type
        if (taskType === 'basic') {
            showModal()
            console.log('Create Basic Task Modal...');
        } else if (taskType === 'checklist') {
            console.log('Create Checklist Task Modal...');
        } else if (taskType === 'deadline') {
            console.log('Create Deadline Task Modal...');
        } else if (taskType === 'recurring') {
            console.log('Create Recurring Task Modal...');
        }
    });
});


initializeApp();

(async ()=>{
    populateFavorites();
    await populateWorkspaces();
    initializeDropdowns();
    initializeClickHandlers();
    await GetTasks()
})


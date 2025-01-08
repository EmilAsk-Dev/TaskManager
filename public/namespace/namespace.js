document.addEventListener('DOMContentLoaded', function() {
    // View switching functionality
    const viewButtons = document.querySelectorAll('.view-btn');
    const views = document.querySelectorAll('.view');
    let currentView = 'board';

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and views
            viewButtons.forEach(btn => btn.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));

            // Add active class to clicked button and corresponding view
            button.classList.add('active');
            currentView = button.getAttribute('data-view');
            const selectedView = document.querySelector(`.${currentView}-view`);
            selectedView.classList.add('active');

            // Show/hide board controls
            const boardControls = document.querySelector('.board-controls');
            if (currentView === 'board') {
                boardControls.style.display = 'flex';
            } else {
                boardControls.style.display = 'none';
            }

            // Initialize the selected view
            initializeView(currentView);
        });
    });

    // Initialize view based on type
    function initializeView(viewType) {
        switch(viewType) {
            case 'board':
                initializeBoardView();
                break;
            case 'list':
                initializeListView();
                break;
            case 'calendar':
                initializeCalendarView();
                break;
            case 'gantt':
                initializeGanttView();
                break;
            case 'table':
                initializeTableView();
                break;
        }
    }

    // Board view functionality
    function initializeBoardView() {
        // Initialize drag and drop
        const taskCards = document.querySelectorAll('.task-card');
        const dropZones = document.querySelectorAll('.board-column .tasks');

        taskCards.forEach(card => {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('drop', handleDrop);
        });

        // Initialize column add task buttons
        const addTaskButtons = document.querySelectorAll('.board-column .add-task');
        addTaskButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const column = e.target.closest('.board-column');
                addNewTask(column);
            });
        });

        // Initialize column menu buttons
        const columnMenuButtons = document.querySelectorAll('.column-menu');
        columnMenuButtons.forEach(button => {
            button.addEventListener('click', showColumnMenu);
        });
    }

    // Drag and Drop handlers
    function handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.outerHTML);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const column = e.target.closest('.board-column');
        const tasksContainer = column.querySelector('.tasks');
        const draggedTaskHTML = e.dataTransfer.getData('text/plain');
        
        // Remove the original task
        const draggingTask = document.querySelector('.dragging');
        if (draggingTask) {
            draggingTask.remove();
        }

        // Add the task to the new column
        tasksContainer.insertAdjacentHTML('beforeend', draggedTaskHTML);
        
        // Update task counts
        updateTaskCounts();
        
        // Remove drag-over highlight
        column.classList.remove('drag-over');
    }

    // Task management functions
    function addNewTask(column) {
        const tasksContainer = column.querySelector('.tasks');
        const taskCount = tasksContainer.children.length + 1;
        const newTask = document.createElement('div');
        newTask.className = 'task-card';
        newTask.draggable = true;
        newTask.innerHTML = `
            <div class="task-header">Task ${taskCount}</div>
            <div class="task-subtitle">in Project 1</div>
            <div class="task-icons">
                <span class="icon">◉</span>
                <span class="icon">□</span>
                <span class="icon">⚑</span>
            </div>
        `;

        // Add drag and drop listeners
        newTask.addEventListener('dragstart', handleDragStart);
        newTask.addEventListener('dragend', handleDragEnd);

        tasksContainer.appendChild(newTask);
        updateTaskCounts();
    }

    function updateTaskCounts() {
        const columns = document.querySelectorAll('.board-column');
        columns.forEach(column => {
            const count = column.querySelector('.tasks').children.length;
            column.querySelector('.task-count').textContent = count;
        });
    }

    function showColumnMenu(e) {
        const menu = document.createElement('div');
        menu.className = 'column-menu-dropdown';
        menu.innerHTML = `
            <div class="menu-item">Add Task</div>
            <div class="menu-item">Edit Column</div>
            <div class="menu-item">Hide Column</div>
            <div class="menu-item">Delete Column</div>
        `;

        // Position the menu
        const button = e.target;
        const rect = button.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = `${rect.bottom + 5}px`;
        menu.style.left = `${rect.left}px`;

        // Add click handlers
        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                handleColumnMenuAction(e.target.textContent, button.closest('.board-column'));
            }
            menu.remove();
        });

        // Remove menu when clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });

        document.body.appendChild(menu);
    }

    function handleColumnMenuAction(action, column) {
        switch(action) {
            case 'Add Task':
                addNewTask(column);
                break;
            case 'Edit Column':
                // Implement column editing
                break;
            case 'Hide Column':
                column.style.display = 'none';
                break;
            case 'Delete Column':
                if (confirm('Are you sure you want to delete this column?')) {
                    column.remove();
                }
                break;
        }
    }

    // Initialize other views
    function initializeListView() {
        const listView = document.querySelector('.list-view');
        listView.innerHTML = '<div class="list-placeholder">List View Content</div>';
    }

    function initializeCalendarView() {
        const calendarView = document.querySelector('.calendar-view');
        calendarView.innerHTML = '<div class="calendar-placeholder">Calendar View Content</div>';
    }

    function initializeGanttView() {
        const ganttView = document.querySelector('.gantt-view');
        ganttView.innerHTML = '<div class="gantt-placeholder">Gantt View Content</div>';
    }

    function initializeTableView() {
        const tableView = document.querySelector('.table-view');
        tableView.innerHTML = '<div class="table-placeholder">Table View Content</div>';
    }

    // Initialize the default view (board)
    initializeView('board');
});
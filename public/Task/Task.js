document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    const mainContent = document.querySelector('.main-content');
    const taskList = document.getElementById('task-list');
    const taskModal = document.getElementById('taskModal');
    const calendarBody = document.querySelector('.calendar-body');
    const closeModal = document.querySelector('.close');
    let tasks = [];

    // Toggle sidebar visibility
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('shrink');
    });

    // Close modal functionality
    closeModal.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });

    async function fetchTasks() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log(data);

            if (data?.success && Array.isArray(data.tasks)) {
                tasks = data.tasks;
                renderTasks(tasks);
                renderCalendar();
                highlightDaysWithTasks();
            } else {
                throw new Error('Expected an array of tasks in the response.');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    function renderTasks(tasks) {
        if (!taskList) {
            console.error('Task list element not found!');
            return;
        }

        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');

            const taskTitle = document.createElement('h4');
            taskTitle.textContent = task.TaskName;

            const taskDescription = document.createElement('p');
            taskDescription.textContent = task.Description;

            const taskStatus = document.createElement('p');
            taskStatus.textContent = `Status: ${task.Status}`;
            
            taskStatus.classList.add(`task-status-${task.Status.toLowerCase()}`);
            taskDiv.append(taskTitle, taskDescription, taskStatus);
            taskList.appendChild(taskDiv);
        });
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/categories');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log('Fetched Categories Data:', data);

            if (data?.success && Array.isArray(data.categories?.categories)) {
                renderCategories(data.categories.categories);
            } else {
                throw new Error('Expected an array of categories in the response.');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    function renderCategories(categories) {
        const categoryList = document.getElementById('category-list');
        if (!categoryList) {
            console.error('Category list element not found!');
            return;
        }

        categoryList.innerHTML = '';
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');

            const categoryTitle = document.createElement('h2');
            categoryTitle.textContent = category.CategoryName;

            categoryDiv.addEventListener('click', () => fetchCategoryTasks(category.CategoryID));
            categoryDiv.appendChild(categoryTitle);
            categoryList.appendChild(categoryDiv);
        });
    }

    async function fetchCategoryTasks(categoryID) {
        try {
            const response = await fetch(`/category/${categoryID}`);
            if (!response.ok) throw new Error(`Failed to fetch tasks for category ${categoryID}`);
            
            const data = await response.json();
            console.log('Fetched tasks for category:', data);

            if (data?.success && Array.isArray(data.tasks)) {
                renderCategoryTasksInModal(data.tasks, categoryName);
            } else {
                throw new Error('No tasks found for this category.');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    function renderCategoryTasksInModal(categoryName, tasks) {
        const taskModalContent = document.querySelector('#taskModal .modal-content');
        taskModalContent.innerHTML = '';
    
        // Add category name at the top
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = categoryName; // Set the category name
        categoryTitle.classList.add('category-title'); // Add a class for styling
        taskModalContent.appendChild(categoryTitle); // Add title to the modal
    
        if (tasks.length > 0) {
            tasks.forEach(task => {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task-item');
    
                taskDiv.innerHTML = `   
                    <h4> ${task.TaskName}</h4>
                    <p> ${task.Description}</p>
                    <p class="task-status">${task.Status}</p>
                `;
    
                taskModalContent.appendChild(taskDiv);
            });
        } else {
            taskModalContent.innerHTML += '<p>No tasks available for this category.</p>';
        }
    
        taskModal.style.display = 'block';
    }

    async function renderCalendar() {
        const today = new Date();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const calendarHeader = document.querySelector('.calendar-header');
        calendarHeader.innerHTML = daysOfWeek.map(day => `<span>${day}</span>`).join('');

        const daysInCalendar = Array.from({ length: 7 }, (_, i) => {
            const day = new Date();
            day.setDate(today.getDate() + i);
            return day;
        });

        calendarBody.innerHTML = '';
        daysInCalendar.forEach(day => {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day');
            dayBox.textContent = day.getDate();

            if (day.toDateString() === today.toDateString()) dayBox.classList.add('highlight');

            const tasksForThisDay = tasks.filter(task => {
                const taskDate = new Date(task.DueDate);
                return taskDate.toDateString() === day.toDateString();
            });

            if (tasksForThisDay.length > 0) {
                dayBox.classList.add('task-day');
                dayBox.addEventListener('click', () => openModal(day, tasksForThisDay));
            }

            calendarBody.appendChild(dayBox);
        });
    }

    function openModal(date, tasksForDay) {
        const modalContent = taskModal.querySelector('.modal-content');
        modalContent.innerHTML = `<h3>Tasks for ${date.toDateString()}</h3>`;

        if (tasksForDay.length > 0) {
            tasksForDay.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.classList.add('task-item');

                taskItem.innerHTML = `
                    <h4>${task.TaskName}</h4>
                    <p><strong>Due:</strong> ${new Date(task.DueDate).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${task.Description || 'No description'}</p>
                    <p><strong>Status:</strong> ${task.Status}</p>
                `;
                
                modalContent.appendChild(taskItem);
            });
        } else {
            modalContent.innerHTML = '<p>No tasks for this day.</p>';
        }

        taskModal.style.display = 'block';
    }

    function highlightDaysWithTasks() {
        const days = document.querySelectorAll('.day');

        days.forEach(day => {
            const dayDate = parseInt(day.textContent);
            const tasksForDay = tasks.filter(task => {
                const taskDate = new Date(task.DueDate);
                return taskDate.getDate() === dayDate;
            });

            if (tasksForDay.length > 0) {
                day.classList.add('highlight');
                day.addEventListener('click', () => openModal(dayDate, tasksForDay));
            }
        });
    }

    // Initial fetch calls
    fetchTasks();
    fetchCategories();
});

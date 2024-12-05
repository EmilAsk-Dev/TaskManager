document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    const mainContent = document.querySelector('.main-content');
    const taskList = document.getElementById('task-list');
    const taskModal = document.getElementById("taskModal");
    const calendarBody = document.querySelector(".calendar-body");
    const closeModal = document.getElementsByClassName("close")[0];

    let tasks = [];

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('shrink');
    });

    // ######## TASK FUNCTIONS #########################################
    async function fetchTasks(status = null, priority = null, page = 1, pageSize = 10) {
        try {
            // Build query parameters dynamically
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (priority) params.append('priority', priority);
            params.append('page', page);
            params.append('pageSize', pageSize);

            // Fetch tasks from the /tasks/sorted endpoint
            const response = await fetch(`/tasks/sorted?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Parse response JSON
            console.log("Tasks fetched:", data);

            // Check if tasks exist and are an array
            if (data.success && Array.isArray(data.tasks)) {
                tasks = data.tasks; // Assign tasks to global array
                renderTasks(); // Render tasks in the task list
                renderCalendar(); // Render tasks in the calendar
            } else {
                throw new Error("Expected an array of tasks in the response.");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }

    async function fetchTasks() {
        try {
            const response = await fetch('/tasks'); // Fetch from /tasks endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Parse response as JSON
            console.log(data); // Check the structure of the data
    
            // Check if tasks exist and are an array
            if (data.success && Array.isArray(data.tasks)) {
                tasks = data.tasks; // Assign tasks to the tasks array
                renderTasks(); // Render tasks in the task list
                renderCalendar(); // Render tasks in the calendar
                highlightDaysWithTasks(); // Highlight days with tasks
            } else {
                throw new Error("Expected an array of tasks in the response.");
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }

    // Render tasks in the task list
    function renderTasks() {
        taskList.innerHTML = ""; // Clear existing tasks
    
        tasks.forEach(task => {
            const taskDiv = document.createElement("div");
            taskDiv.classList.add("task-item");
            taskDiv.innerHTML = `
                <span class="task-name">${task.TaskName}</span> 
                <span class="due-date">${new Date(task.DueDate).toLocaleDateString()}</span>`; // Format DueDate for readability
            taskList.appendChild(taskDiv);
        });
    }

    // Render calendar days and add tasks to specific dates
    async function renderCalendar() {
        const today = new Date();
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDay = today.getDay();
        const calendarHeader = document.querySelector(".calendar-header");
        calendarHeader.innerHTML = ""; // Clear existing header

        // Fill the header starting from the current day
        for (let i = 0; i < 7; i++) {
            const dayIndex = (currentDay + i) % 7; // Wrap around the week
            const dayName = daysOfWeek[dayIndex];
            const span = document.createElement("span");
            span.textContent = dayName;
            calendarHeader.appendChild(span);
        }

        const calendarBody = document.querySelector(".calendar-body");
        const daysInCalendar = [];

        // Generate the next 7 days (including today)
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            daysInCalendar.push(nextDay);
        }

        // Clear existing calendar body
        calendarBody.innerHTML = "";

        // Fill the calendar body with the days and highlight the ones with tasks
        daysInCalendar.forEach(day => {
            const dayBox = document.createElement("div");
            dayBox.classList.add("day");
            dayBox.textContent = day.getDate();

            // Highlight the current day
            if (day.toDateString() === today.toDateString()) {
                dayBox.classList.add("highlight");
            }

            // Check if this day has any tasks
            const taskForThisDay = tasks.filter(task => {
                const taskDate = new Date(task.DueDate);
                return taskDate.toDateString() === day.toDateString();
            });

            // If there are tasks for this day, highlight it in green
            if (taskForThisDay.length > 0) {
                dayBox.classList.add("task-day");
            }

            calendarBody.appendChild(dayBox);
        });
    }

    // Highlight days with tasks and attach events
    function highlightDaysWithTasks() {
        const days = document.querySelectorAll('.day');

        days.forEach(day => {
            const dayDate = day.textContent;

            // Check if there are tasks for this date
            const tasksForDay = tasks.filter(task => {
                const taskDate = new Date(task.DueDate);
                return taskDate.getDate() == dayDate;
            });

            // If there are tasks for this day, add a click event to open the modal
            if (tasksForDay.length > 0) {
                day.classList.add('highlight');
                day.addEventListener('click', () => openModal(dayDate, tasksForDay));
            }
        });
    }

    // Open a modal with tasks for a specific day
    function openModal(date, tasksForDay) {
        const modalContent = taskModal.querySelector('.modal-content'); // Ensure you're selecting the right part of the modal
        modalContent.innerHTML = `<h3>Tasks for ${date}</h3>`;
    
        // Check if there are tasks for this day
        if (tasksForDay.length > 0) {
            tasksForDay.forEach(task => {
                const taskItem = document.createElement("div");
                taskItem.classList.add("task-item");
    
                // Create a column layout for task details
                taskItem.innerHTML = `
                    <div class="task-header">
                        <h4>${task.TaskName}</h4>
                        <p><strong>Due:</strong> ${new Date(task.DueDate).toLocaleDateString()}</p>
                    </div>
                    <div class="task-body">
                        <div class="task-row">
                            <div class="task-column">
                                <strong>Description:</strong>
                            </div>
                            <div class="task-column">
                                ${task.Description || "No description available"}
                            </div>
                        </div>
                        <div class="task-row">
                            <div class="task-column">
                                <strong>Status:</strong>
                            </div>
                            <div class="task-column">
                                ${task.Status}
                            </div>
                        </div>
                    </div>
                `;
                modalContent.appendChild(taskItem);
            });
        } else {
            modalContent.innerHTML = "<p>No tasks for this day.</p>";
        }
    
        taskModal.style.display = "block"; // Show the modal
    
        // Close the modal when clicking outside it
        window.onclick = event => {
            if (event.target === taskModal) {
                taskModal.style.display = "none";
            }
        };
    }
    

    // Close modal functionality
    closeModal.addEventListener('click', () => {
        taskModal.style.display = "none";
    });

    // Fetch tasks on load
    fetchTasks();
});

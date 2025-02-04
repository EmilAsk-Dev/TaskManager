

document.addEventListener('DOMContentLoaded', () => {
    let taskList = []
    


    // Sample data
    const favorites = [
        { name: "Marketing Campaign", type: "Board" },
        { name: "Design System", type: "Board" },
        { name: "Product Roadmap", type: "Board" }
    ];

    function countTasksInList(){
        let taskLength = taskList.length;        
        return taskLength
    }

    function getCompletedTasks(){
        completedTaskCount = 0
        taskList.forEach(task => {
            if(task.IsCompleted){
                completedTaskCount++
            }
        });
        return completedTaskCount
    }

    async function RenderData() {    
        
        const res = await fetch('/api/v1/tasks')
        const tasks = await res.json()
        taskList = tasks
        
        const TaskSection = document.getElementById('taskSection');
        tasks.forEach(task => {
            let priorityClass = null
            if(task.Priority == 'High'){
                priorityClass = 'priority-high'
            }
            else if(task.priority == 'Medium'){
                priorityClass = 'priority-medium'
            }
            else{
                priorityClass =  'priority-low'
            }
            
            const item = document.createElement('div');
            item.className = 'task-card';
            item.innerHTML = `
            
                        <div>
                            <h3>${task.TaskName}</h3>
                            <p style="color: #8b8b8b;">${task.TimeEstimateHours} - </p>
                        </div>
                        <span class="priority-tag ${priorityClass}">${task.Priority}</span>
                                                 
            `;
            console.log(tasks)
            
            TaskSection.appendChild(item);
            
        });
        
        let TasksCount = countTasksInList()
        const countElements = document.getElementById('TasksCount')
        countElements.innerHTML = TasksCount

        
        let TasksCompleteCount = getCompletedTasks()
        const TasksCompleted = document.getElementById('taskcompleted')

        TasksCompleted.innerHTML = TasksCompleteCount
        
        
            

        
        
    }



    
    

    // Populate dynamic content
    // function populateFavorites() {
    //     const favoritesList = document.getElementById('favorites-list');
    //     favorites.forEach(favorite => {
    //         const item = document.createElement('li');
    //         item.className = 'dropdown-item';
    //         item.textContent = favorite.name;
    //         favoritesList.appendChild(item);
    //     });
    // }

    // async function populateWorkspaces() {
        
        
    //     const res = await fetch('/api/v1/workspace')
    //     const workspaces = await res.json()

    //     const workspacesList = document.getElementById('workspaces-list');
    //     workspaces.forEach(workspace => {
    //         const item = document.createElement('li');
    //         item.className = 'workspace-item';
    //         item.innerHTML = `
            
    //             <span class="workspace-icon">${workspace.icon}</span>
    //             <div class="workspace-info">
    //                 <span class="workspace-name">${workspace.name}</span>
    //                 <span class="workspace-type">${workspace.type}</span>
    //             </div>
            
    //         `;
    //         workspacesList.appendChild(item);
    //     });
    // }

    // Initialize dropdowns
    // function initializeDropdowns() {
    //     const navItems = document.querySelectorAll('.nav-item');
        
    //     navItems.forEach(item => {
    //         const header = item.querySelector('.nav-header');
            
    //         header.addEventListener('click', (e) => {
    //             e.stopPropagation();
                
    //             // If I want to only be able to open one dropdown
    //             // navItems.forEach(otherItem => {
    //             //     if (otherItem !== item) {
    //             //         otherItem.classList.remove('active');
    //             //     }
    //             // });
                
    //             // Toggle current dropdown
    //             item.classList.toggle('active');
    //         });
    //     });

    //     // Close dropdowns when clicking outside
    //     document.addEventListener('click', () => {
    //         navItems.forEach(item => item.classList.remove('active'));
    //     });

        // Prevent dropdown close when clicking inside
    //     const dropdowns = document.querySelectorAll('.nav-dropdown');
    //     dropdowns.forEach(dropdown => {
    //         dropdown.addEventListener('click', (e) => {
    //             e.stopPropagation();
    //         });
    //     });
    // }

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
    
    // Reference to the container where cards will be displayed
    const recentCardsContainer = document.getElementById('recentCardsContainer');
    
    // Function to display the recently visited items
    // async function displayRecentlyVisited() {
    //     // Clear the container
    //     recentCardsContainer.innerHTML = "";
        
    //     const res = await fetch('/api/v1/namespaces/recent')
    //     const recentlyVisited = await res.json()

    //     // Generate cards from the array
    //     recentlyVisited.forEach(item => {
    //         // Create card container

    //         const card = document.createElement('div');
    //         card.classList.add('recent-card');
            
    //         card.addEventListener('click', ()=>{
    //             window.location.href = `/namespace/${item.id}`
    //         })
    //         // Create card preview
    //         const preview = document.createElement('div');
    //         preview.classList.add('card-preview');
    
    //         // Create card info container
    //         const info = document.createElement('div');
    //         info.classList.add('card-info');
    
    //         // Create title and subtitle elements
    //         const cardTitle = document.createElement('h3');
    //         cardTitle.textContent = item.name;
    
    //         const cardSubtitle = document.createElement('span');
    //         cardSubtitle.textContent = item.type;
    
    //         // Append title and subtitle to info
    //         info.appendChild(cardTitle);
    //         info.appendChild(cardSubtitle);
    
    //         // Append preview and info to card
    //         card.appendChild(preview);
    //         card.appendChild(info);
            
    //         // Append card to the container
    //         recentCardsContainer.appendChild(card);
    //     });
    // }

    

    document.getElementById('darkModeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    window.addEventListener('load', function() {
        document.body.classList.add('dark-mode');
    });


    //Calander
    class TaskCalendar {
        constructor() {
            this.currentDate = new Date();
            this.selectedDate = null;
            this.currentView = 'month';
            this.tasks = {
                '2025-02-03': [
                    { title: 'Team Meeting', priority: 'high' },
                    { title: 'Code Review', priority: 'medium' }
                ],
                '2025-02-05': [
                    { title: 'Project Demo', priority: 'high' }
                ],
                '2025-02-10': [
                    { title: 'Documentation', priority: 'low' }
                ]
            };

            this.init();
        }

        init() {
            this.attachEventListeners();
            this.render();
        }

        attachEventListeners() {
            document.getElementById('prevBtn').addEventListener('click', () => {
                if (this.currentView === 'month') {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                } else {
                    this.currentDate.setDate(this.currentDate.getDate() - 7);
                }
                this.render();
            });

            document.getElementById('nextBtn').addEventListener('click', () => {
                if (this.currentView === 'month') {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                } else {
                    this.currentDate.setDate(this.currentDate.getDate() + 7);
                }
                this.render();
            });

            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentView = e.target.dataset.view;
                    this.render();
                });
            });
        }

        getMonthData() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            return { year, month, daysInMonth, startingDay };
        }

        getWeekDates() {
            const curr = new Date(this.currentDate);
            const week = [];
            
            // Finding Sunday
            curr.setDate(curr.getDate() - curr.getDay());
            
            for (let i = 0; i < 7; i++) {
                week.push(new Date(curr));
                curr.setDate(curr.getDate() + 1);
            }
            
            return week;
        }

        formatDate(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }

        createDayElement(date, isCurrentMonth = true) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            if (!isCurrentMonth) {
                dayEl.style.opacity = '0.5';
            }

            const today = new Date();
            const formattedDate = this.formatDate(date);

            if (date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            if (this.tasks[formattedDate]) {
                dayEl.classList.add('has-tasks');
            }

            if (this.selectedDate && this.formatDate(this.selectedDate) === formattedDate) {
                dayEl.classList.add('selected');
            }

            dayEl.innerHTML = `<span>${date.getDate()}</span>`;

            // Task preview on hover
            if (this.tasks[formattedDate]) {
                dayEl.addEventListener('mouseenter', (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'task-preview visible';
                    preview.innerHTML = `
                        <ul class="task-list">
                            ${this.tasks[formattedDate].map(task => `
                                <li class="task-item ${task.priority}">
                                    ${task.title}
                                </li>
                            `).join('')}
                        </ul>
                    `;
                    dayEl.appendChild(preview);
                });

                dayEl.addEventListener('mouseleave', () => {
                    const preview = dayEl.querySelector('.task-preview');
                    if (preview) preview.remove();
                });
            }

            dayEl.addEventListener('click', () => {
                this.selectedDate = date;
                this.render();
            });

            return dayEl;
        }

        renderMonth() {
            const { year, month, daysInMonth, startingDay } = this.getMonthData();
            const calendar = document.getElementById('calendar');
            calendar.className = 'calendar-grid';
            calendar.innerHTML = '';

            // Add weekday headers
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weekdays.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'weekday-header';
                dayHeader.textContent = day;
                calendar.appendChild(dayHeader);
            });

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < startingDay; i++) {
                const prevMonthDate = new Date(year, month, -startingDay + i + 1);
                calendar.appendChild(this.createDayElement(prevMonthDate, false));
            }

            // Add days of the current month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                calendar.appendChild(this.createDayElement(date));
            }

            // Add empty cells for days after the last day of the month
            const remainingDays = 42 - (startingDay + daysInMonth); // 42 = 6 rows × 7 days
            for (let i = 1; i <= remainingDays; i++) {
                const nextMonthDate = new Date(year, month + 1, i);
                calendar.appendChild(this.createDayElement(nextMonthDate, false));
            }
        }

        renderWeek() {
            const calendar = document.getElementById('calendar');
            calendar.className = 'calendar-grid week-view';
            calendar.innerHTML = '';

            const weekDates = this.getWeekDates();
            
            // Add time slots header
            calendar.appendChild(document.createElement('div')); // Empty corner cell
            weekDates.forEach(date => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'weekday-header';
                dayHeader.textContent = `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]} ${date.getDate()}`;
                calendar.appendChild(dayHeader);
            });

            // Add time slots
            for (let hour = 9; hour <= 17; hour++) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = `${hour}:00`;
                calendar.appendChild(timeSlot);

                weekDates.forEach(date => {
                    const slot = document.createElement('div');
                    slot.className = 'calendar-day';
                    const formattedDate = this.formatDate(date);
                    if (this.tasks[formattedDate]) {
                        slot.classList.add('has-tasks');
                    }
                    calendar.appendChild(slot);
                });
            }
        }

        render() {
            document.getElementById('currentMonth').textContent = this.currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
            });

            if (this.currentView === 'month') {
                this.renderMonth();
            } else {
                this.renderWeek();
            }
        }
    }

    // Initialize the calendar
    const calendar = new TaskCalendar();

    
 
    // Initialize everything
    (async ()=>{
        
        // populateFavorites();
        // await populateWorkspaces();
        await RenderData()
        
        // initializeDropdowns();
        // initializeClickHandlers();
        // displayRecentlyVisited();
    })()
    
});
document.addEventListener('DOMContentLoaded', async () => {
    const asapTaskList = document.getElementById('asap-task-list');
    const completedTaskList = document.getElementById('completed-task-list');

    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoriesList = document.getElementById('categories-list');

    const addTaskBtn = document.getElementById('add-task-btn');
    const addTaskModal = document.getElementById('addTaskModal');
    const addTaskSpan = document.querySelector('#addTaskModal .close');

    const removeTasksModal = document.getElementById('removeTasksModal');
    const closeRemoveTasksModalBtn = document.querySelector('#removeTasksModal .close');
    const removeTasksBtn = document.getElementById('removeTasksBtn');
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    const removeTasksList = document.getElementById('remove-tasks-list');

    const assignCategoryModal = document.getElementById('assignCategoryModal');
    const categoryListContainer = document.getElementById('category-list-container');
    const assignCategoryBtn = document.getElementById('assign-category-btn');

    const categoryTasksModal = document.getElementById('categoryTasksModal');
    const categoryTasksTitle = document.getElementById('categoryTasksTitle');
    const categoryTasksList = document.getElementById('categoryTasksList');

    let tasks = [];
    let categories = [];


    function closeModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    async function fetchAndDisplayTasks() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) throw new Error('Failed to fetch tasks');
            
            tasks = await response.json();
            updateTaskLists();
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
        }
    }

    function updateTaskLists() {
        if (!asapTaskList || !completedTaskList) return;

        asapTaskList.innerHTML = '';
        completedTaskList.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.status) {
                completedTaskList.appendChild(taskElement);
            } else {
                asapTaskList.appendChild(taskElement);
            }
        });
    }

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" id="taskCheckbox_${task.id}" name="taskCheckbox" data-task-id="${task.id}" ${task.status ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <div class="task-header">
                    <h3>${task.name}</h3>
                    <div class="dropdown">
                        <img src="/svg/burgermenu.svg" alt="Settings" class="dropbtn" id="menuButton_${task.id}">
                        <div class="dropdown-content" id="dropdownContent_${task.id}">
                            <a href="#RemoveTask" class="remove-task">Remove task</a>
                            <a href="#AssignCategory" class="assign-category">Assign Category</a>
                        </div>
                    </div>
                </div>
                <div class="task-details">
                    <p>Description: ${task.description}</p>
                    <p>Due: ${task.dueDate}</p>
                    <p>Priority: ${task.priority} Level</p>
                    <p>Category: ${task.category ? task.category.name : 'Uncategorized'}</p>
                </div>
            </div>
        `;

        const taskHeader = taskElement.querySelector('.task-header h3');
        const taskDetails = taskElement.querySelector('.task-details');
        const dropbtn = taskElement.querySelector('.dropbtn');
        const dropdownContent = taskElement.querySelector('.dropdown-content');

        if (taskHeader) {
            taskHeader.addEventListener('click', () => taskDetails.classList.toggle('show-details'));
        }

        if (dropbtn && dropdownContent) {
            dropbtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
            });

            document.addEventListener('click', (e) => {
                if (!dropbtn.contains(e.target)) {
                    dropdownContent.style.display = 'none';
                }
            });
        }

        if (dropdownContent) {
            const removeTaskBtn = dropdownContent.querySelector('.remove-task');
            const assignCategoryBtn = dropdownContent.querySelector('.assign-category');
            if (removeTaskBtn) {
                removeTaskBtn.addEventListener('click', () => removeTask(task.id));
            }
            if (assignCategoryBtn) {
                assignCategoryBtn.addEventListener('click', () => showAssignCategoryModal(task.id));
            }
        }

        const checkbox = taskElement.querySelector(`#taskCheckbox_${task.id}`);
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                checkbox.checked ? confirmTaskCompletion(task, taskElement) : asapTaskList.appendChild(taskElement);
            });
        }

        return taskElement;
    }

    function confirmTaskCompletion(task, taskElement) {
        Swal.fire({
            title: `Mark "${task.name}" as Completed?`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, It\'s done!'
        }).then((result) => {
            if (result.isConfirmed) {
                markTaskAsCompleted(task.id, taskElement);
            } else {
                document.querySelector(`#taskCheckbox_${task.id}`).checked = false;
            }
        });
    }

    async function markTaskAsCompleted(taskId, taskElement) {
        try {
            const response = await fetch(`/tasks/${taskId}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error('Failed to mark task as completed');

            completedTaskList.appendChild(taskElement);
        } catch (error) {
            console.error('Error marking task as completed:', error.message);
        }
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Enter category name',
                input: 'text',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Add'
            }).then((result) => {
                if (result.isConfirmed) {
                    addCategory(result.value);
                }
            });
        });
    }

    async function addCategory(categoryName) {
        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: categoryName })
            });
            if (!response.ok) throw new Error('Failed to add category');

            const newCategory = await response.json();
            categories.push(newCategory);
            const categoryElement = createCategoryElement(newCategory);
            categoriesList.appendChild(categoryElement);
        } catch (error) {
            console.error('Error adding category:', error.message);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');

            categories = await response.json();
            if (categoriesList) {
                categoriesList.innerHTML = '';
                categories.forEach(category => {
                    const categoryElement = createCategoryElement(category);
                    categoriesList.appendChild(categoryElement);
                });
            }
        } catch (error) {
            console.error('Error fetching categories:', error.message);
        }
    }



    async function removeCategory(categoryId, categoryElement) {
        try {
            const response = await fetch(`/categories/${categoryId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove category');

            categoryElement.remove();
            categories = categories.filter(cat => cat.id !== categoryId);
        } catch (error) {
            console.error('Error removing category:', error.message);
        }
    }

    async function removeTask(taskId) {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to remove this task?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, remove it!',
                cancelButtonText: 'No, cancel!'
            });
    
            if (result.isConfirmed) {
                const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to remove task');
    
                const taskElement = document.querySelector(`#taskCheckbox_${taskId}`).closest('.task');
                if (taskElement) taskElement.remove();
    
                Swal.fire('Removed!', 'Your task has been removed.', 'success');
            }
        } catch (error) {
            console.error('Error removing task:', error.message);
            Swal.fire('Error!', 'Failed to remove task.', 'error');
        }
    }

    async function fetchTasksForCategory(categoryId) {
        try {
            const response = await fetch(`/categories/${categoryId}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks for category');
            
            const categoryTasks = await response.json();
            displayCategoryTasks(categoryTasks);
        } catch (error) {
            console.error('Error fetching tasks for category:', error.message);
        }
    }

    function displayCategoryTasks(tasks) {
        if (!categoryTasksList) return;

        categoryTasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            categoryTasksList.appendChild(taskElement);
        });
    }

    function showCategoryTasksModal(category) {
        if (categoryTasksModal && categoryTasksTitle && categoryTasksList) {
            categoryTasksTitle.textContent = `Tasks in "${category.name}"`;
            fetchTasksForCategory(category.id);
            categoryTasksModal.style.display = 'block';
        }
    }

    function showAssignCategoryModal(taskId) {
        if (assignCategoryModal) {
            assignCategoryModal.style.display = 'block';
            categoryListContainer.innerHTML = '';
            categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category-option';
                categoryElement.innerHTML = `
                    <input type="radio" id="category_${category.id}" name="category" value="${category.id}">
                    <label for="category_${category.id}">${category.name}</label>
                `;
                categoryListContainer.appendChild(categoryElement);
            });

            if (assignCategoryBtn) {
                assignCategoryBtn.onclick = () => assignCategoryToTask(taskId);
            }
        }
    }

    function createCategoryElement(category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        categoryElement.innerHTML = `
            <div class="category-header">
                <h3>${category.name}</h3>
                <button class="remove-category-btn" data-category-id="${category.id}">Remove</button>
            </div>
        `;

        categoryElement.querySelector('h3').addEventListener('click', () => showCategoryTasksModal(category));

        const removeBtn = categoryElement.querySelector('.remove-category-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                Swal.fire({
                    title: `Remove category "${category.name}"?`,
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, remove it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        removeCategory(category.id, categoryElement);
                    }
                });
            });
        }

        return categoryElement;
    }

    

    async function assignCategoryToTask(taskId) {
    try {
        const selectedCategory = document.querySelector('input[name="category"]:checked');
        if (!selectedCategory) return;

        const categoryId = parseInt(selectedCategory.value);
        const response = await fetch(`/tasks/${taskId}/category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId })
        });

        if (!response.ok) throw new Error('Failed to assign category to task');

        const category = categories.find(cat => cat.id === categoryId);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.category = category;
            updateTaskLists();
        }
        if (assignCategoryModal) {
            assignCategoryModal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error assigning category to task:', error.message);
    }
}

    // Close modal when clicking the close button
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            const modal = document.getElementById(modalId);
            closeModal(modal);
        });
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });



    async function showCategoryTasks(categoryId) {
        try {
            const response = await fetch(`/categories/${categoryId}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks for category');
    
            const tasks = await response.json();
    
            if (categoryTasksTitle && categoryTasksList) {
                const category = categories.find(cat => cat.id === categoryId);
                categoryTasksTitle.textContent = `Tasks in "${category.name}"`;
                categoryTasksList.innerHTML = '';
                tasks.forEach(task => {
                    const taskElement = createTaskElement(task);
                    categoryTasksList.appendChild(taskElement);
                });
                categoryTasksModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching tasks for category:', error.message);
        }
    }

    if (closeRemoveTasksModalBtn) {
        closeRemoveTasksModalBtn.addEventListener('click', () => {
            if (removeTasksModal) removeTasksModal.style.display = 'none';
        });
    }

    if (removeTasksBtn) {
        removeTasksBtn.addEventListener('click', () => {
            if (removeTasksModal) removeTasksModal.style.display = 'block';
        });
    }

    if (confirmRemoveBtn) {
        confirmRemoveBtn.addEventListener('click', removeTasks);
    }

    async function removeTasks() {
        try {
            const taskIds = Array.from(removeTasksList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.getAttribute('data-task-id'));
            if (taskIds.length === 0) return;

            const response = await fetch('/tasks/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: taskIds })
            });

            if (!response.ok) throw new Error('Failed to remove tasks');

            taskIds.forEach(taskId => {
                const taskElement = document.querySelector(`#taskCheckbox_${taskId}`).closest('.task');
                if (taskElement) taskElement.remove();
            });

            if (removeTasksModal) removeTasksModal.style.display = 'none';
        } catch (error) {
            console.error('Error removing tasks:', error.message);
        }
    }

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            if (addTaskModal) addTaskModal.style.display = 'block';
        });
    }

    if (addTaskSpan) {
        addTaskSpan.addEventListener('click', () => {
            if (addTaskModal) addTaskModal.style.display = 'none';
        });
    }

    document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', () => {
            const taskDetails = button.closest('.task').querySelector('.task-details');
            taskDetails.classList.toggle('show-details');
            button.textContent = taskDetails.classList.contains('show-details') ? 'Hide Details' : 'Show Details';
        });
    });
    
    await fetchAndDisplayTasks();
    await fetchCategories();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('AdminPage is running');    

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
    
    function updateUserTable(users) {
        const userTableBody = document.querySelector('.TableAdmin tbody');
        if (!userTableBody) return;
    
        userTableBody.innerHTML = ''; // Clear existing rows
    
        users.forEach(user => {
            const userRow = createUserRow(user);
            userTableBody.appendChild(userRow);
        });
    }
    
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
        
        row.addEventListener('click', () => showUserDetails(user));

        return row;
    }
    
    function createTableCell(content, className) {
        const cell = document.createElement('td');
        cell.className = className;
        cell.textContent = content;
        return cell;
    }

    fetchAndDisplayUsers()
    });
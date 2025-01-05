// fakeData.js

// Fake Users Data
const users = [
    { UserID: 1, username: 'admin', name: 'Admin User', role: 'admin', email: 'admin@example.com' }
];

// Fake Workspaces Data (each workspace linked to a User)
const workspaces = [
    { WorkspaceID: 1, UserID: 1, name: 'Workspace 1', description: 'First workspace', createdAt: '2024-01-01' },
    { WorkspaceID: 2, UserID: 1, name: 'Workspace 2', description: 'Second workspace', createdAt: '2024-01-02' }
];

// Fake Tasks Data (tasks assigned to specific workspaces)
const tasks = [
    { TaskID: 1, WorkspaceID: 1, title: 'Task 1', description: 'First task', completed: false },
    { TaskID: 2, WorkspaceID: 1, title: 'Task 2', description: 'Second task', completed: false },
    { TaskID: 3, WorkspaceID: 2, title: 'Task 3', description: 'Third task', completed: true }
];

module.exports = { users, workspaces, tasks };

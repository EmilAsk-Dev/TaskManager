

document.addEventListener('DOMContentLoaded', () => {

    
    // Sample data
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
    
    // Reference to the container where cards will be displayed
    const recentCardsContainer = document.getElementById('recentCardsContainer');
    
    // Function to display the recently visited items
    async function displayRecentlyVisited() {
        // Clear the container
        recentCardsContainer.innerHTML = "";
        
        const res = await fetch('/api/v1/namespaces/recent')
        const recentlyVisited = await res.json()

        // Generate cards from the array
        recentlyVisited.forEach(item => {
            // Create card container

            const card = document.createElement('div');
            card.classList.add('recent-card');
            
            card.addEventListener('click', ()=>{
                window.location.href = `/namespace/${item.id}`
            })
            // Create card preview
            const preview = document.createElement('div');
            preview.classList.add('card-preview');
    
            // Create card info container
            const info = document.createElement('div');
            info.classList.add('card-info');
    
            // Create title and subtitle elements
            const cardTitle = document.createElement('h3');
            cardTitle.textContent = item.name;
    
            const cardSubtitle = document.createElement('span');
            cardSubtitle.textContent = item.type;
    
            // Append title and subtitle to info
            info.appendChild(cardTitle);
            info.appendChild(cardSubtitle);
    
            // Append preview and info to card
            card.appendChild(preview);
            card.appendChild(info);
            
            // Append card to the container
            recentCardsContainer.appendChild(card);
        });
    }

    

    document.getElementById('darkModeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    window.addEventListener('load', function() {
        document.body.classList.add('dark-mode');
    });


    

    // Initialize everything
    (async ()=>{
        populateFavorites();
        await populateWorkspaces();
        initializeDropdowns();
        initializeClickHandlers();
        displayRecentlyVisited();
    })()
    
});
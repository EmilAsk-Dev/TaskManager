document.addEventListener("DOMContentLoaded", function() {
    const customScrollbar = document.querySelector(".custom-scrollbar");
    const scrollbarThumb = document.querySelector(".custom-scrollbar-thumb");
    const upcomingTasks = document.querySelector(".upcoming-tasks");

    // Function to update the scrollbar and thumb position
    function updateScrollbar() {
        const scrollHeight = upcomingTasks.scrollHeight;
        const scrollTop = upcomingTasks.scrollTop;
        const clientHeight = upcomingTasks.clientHeight;

        // Only show scrollbar if content is taller than the container
        if (scrollHeight > clientHeight) {
            customScrollbar.style.display = "block";
        } else {
            customScrollbar.style.display = "none";
        }

        // Adjust scrollbar height to match the visible container
        customScrollbar.style.height = `${clientHeight}px`; // Full height of container

        // Calculate scrollbar thumb height relative to content height
        const scrollbarThumbHeight = (clientHeight / scrollHeight) * clientHeight;
        const scrollRatio = scrollTop / (scrollHeight - clientHeight);

        // Update thumb height and position
        scrollbarThumb.style.height = `${scrollbarThumbHeight}px`;
        scrollbarThumb.style.top = `${scrollRatio * (clientHeight - scrollbarThumbHeight)}px`;
    }

    // Listen to scroll events and update scrollbar
    upcomingTasks.addEventListener("scroll", updateScrollbar);

    // Optionally, make the scrollbar thumb draggable
    scrollbarThumb.addEventListener("mousedown", function(event) {
        const initialMouseY = event.clientY;
        const initialThumbTop = scrollbarThumb.offsetTop;

        function onMouseMove(event) {
            const deltaY = event.clientY - initialMouseY;
            const newTop = initialThumbTop + deltaY;

            // Set thumb position within the bounds of the scrollbar
            if (newTop >= 0 && newTop <= (upcomingTasks.clientHeight - scrollbarThumb.offsetHeight)) {
                scrollbarThumb.style.top = `${newTop}px`;
                upcomingTasks.scrollTop = (newTop / upcomingTasks.clientHeight) * upcomingTasks.scrollHeight;
            }
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    // Initial update when the page loads to ensure the scrollbar is correct
    updateScrollbar();
});

import os

# Function to create a new directory and files
def create_project(project_name):
    try:
        # Path to the existing 'public' directory
        public_dir = r'public'
        
        # Check if 'public' directory exists
        if not os.path.exists(public_dir):
            print(f'Error: Directory "{public_dir}" does not exist.')
            return
        
        # Create the project directory inside 'public'
        project_path = os.path.join(public_dir, project_name)
        os.makedirs(project_path)
        
        # Define the file contents (HTML, CSS, JavaScript)
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>{project_name}</title>
    <link rel="stylesheet" type="text/css" href="{project_name}.css">
</head>
<body>
    <h1>Welcome to {project_name}!</h1>
    <script src="{project_name}.js"></script>
</body>
</html>
"""
        css_content = """body {
    font-family: Arial, sans-serif;
}

h1 {
    color: blue;
}
"""
        js_content = f"""document.addEventListener('DOMContentLoaded', function() {{
    console.log('{project_name} is running');
    }});"""
        
        # Create and write to the HTML file
        with open(os.path.join(project_path, f'{project_name}.html'), 'w') as file:
            file.write(html_content)
        
        # Create and write to the CSS file
        with open(os.path.join(project_path, f'{project_name}.css'), 'w') as file:
            file.write(css_content)
        
        # Create and write to the JavaScript file
        with open(os.path.join(project_path, f'{project_name}.js'), 'w') as file:
            file.write(js_content)
        
        # Generate the route handler JavaScript code
        Route = f"""
// Route to serve the {project_name} page
router.get('/{project_name}', (req, res) => {{
    res.sendFile(path.join(__dirname, 'public', '{project_name}', '{project_name}.html'));
}});
"""
        
        # Print success message and route handler
        print(f'Project "{project_name}" created successfully in "{public_dir}" directory!')
        print('Route Handler:')
        print(Route.strip())  # Print the formatted route handler, strip to remove extra newline
        
    except Exception as e:
        print(f'Error: {e}')

# Main function
if __name__ == "__main__":
    project_name = input("Enter the project name: ")
    create_project(project_name)

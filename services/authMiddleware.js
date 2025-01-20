const userService = require('../services/userService'); 

const authenticate = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Fetch user from the database (service layer)
        const user = await userService.authenticateUser(username, password);
        
        // Check if user exists and password matches (plain text comparison)
        if (user) {
            // Store user details in session
            req.session.user = {
                id: user.UserID,
                username: user.Username,
                email: user.Email,
                Role: user.RoleID,
                roleName: user.RoleName
            };

            console.log('Authenticated user:', req.session.user);
            return next(); // Proceed to the next middleware (or route handler)
        } else {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(500).json({ error: 'Server error during authentication' });
    }
};

const isAuth = async (req, res, next) => {
    if(req.session && req.session.user){
        next()
    }
    else{        
        res.status(401).send({error: 'unauthenticated'})
    }
}


module.exports = {
    authenticate,
    isAuth
}

const userService = require('../services/userService');
 

const authenticate = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Fetch user from the database (service layer)
        const users =  await userService.authenticateUser(username, password);
        const user = users[0]
        
        // Check if user exists and password matches
        if (user) {
            req.session.user = {
                UserID: user.UserID,
                Username: user.Username,
                Email: user.Email,
                Role: user.RoleID,
                roleName: user.RoleName,  
                CreatedAt: user.CreatedAt
            };

            
            console.log(user);
            return next();
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
        req.user = req.session.user;
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

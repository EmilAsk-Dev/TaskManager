const userService = require('./userService');

const authenticate = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        const user = await userService.authenticateUser(username, password);

        req.session.user = {
            id: user.UserID,
            username: user.Username,
            email: user.Email,            
            Role: user.RoleID,
            roleName: user.RoleName
            
        };

        console.log('Authenticated user:', req.session.user);
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authenticate;

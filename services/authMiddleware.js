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

//FOR ADMIN DEV TESTING
// const authenticate = async (req, res, next) => {
//     try {        
//         req.session.user = {
//             id: 1,
//             username: 'Admin',
//             email: 'admin1@example.com',            
//             Role: 1,
//             roleName: 'Admin'
            
//         };
//         next()

//         console.log('Authenticated user:', req.session.user);
//         next();
//     } catch (error) {
//         console.error('Authentication error:', error.message);
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// };

module.exports = authenticate;

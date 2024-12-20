const checkAdmin = (req, res, next) => {

    if(req.session.user.Role == 1){
        next()
    }

    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Forbidden: You do not have the necessary permissions');
    }
};

const checkLoggedin = (req, res, next) => {
    next()
    return
    if (req.session.user) {
        next();
    } else {
        res.status(403).send('Forbidden: You do not have the necessary permissions');
    }
};

module.exports =
{
    checkAdmin,
    checkLoggedin
}


module.exports = {
    //user login and signup page session
    userauthenticationCheck: (req, res, next) => {
        if (req.session.user) {
            res.redirect('/');
        } else {
            next();
        }
    },
    adminauthenticationCheck: (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/admin')
        }
    },
    isUserExist: (req, res, next) => {
        req.session.user ? next() : res.redirect('/')
    }
}
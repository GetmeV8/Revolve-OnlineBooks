
module.exports = {
    //user login and signup page session
    authenticationCheck: (req, res, next) => {
        if (req.session.user) {
            res.redirect('/user-home');
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
    }
}
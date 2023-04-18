
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
        try{
            req.session.user ? next() : res.redirect('/')
        }catch(error){
            console.log(error)
            res.send(500).json({ message: 'session error while login'})
        }
    },
    isAdminExist: (req, res, next) => {
        try {
          req.session.admin ? next() : res.redirect('/admin')
        } catch (error) {
          console.log(error)
          res.send(500).json({ message: 'session error while login' })
        }
      },
}
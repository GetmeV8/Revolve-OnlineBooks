const { response } = require('express');
const session = require('express-session');
const userHelper = require('../helpers/user-helpers');
const { doSignup } = require('../helpers/user-helpers');
let twilio = require('../middlewares/twilio')

module.exports = {
  userLogin: (req, res, next) => {
    if (req.session.loggedUserIn) {
      res.redirect('/user-home')
    } else {
      res.render('user/user-login', { Blocked: req.session.adminBlocked })
      req.session.adminBlocked = null;
    }
  },
  loginForm: (req, res, next) => {
    // console.log(req.body)
    userHelper.doLogin(req.body).then((response) => {
      console.log(response)
      if (response.blocked) {
        req.session.adminBlocked = "Your accout is blocked by admin"
        res.redirect('/')
      }
      else if (response.status) {
        req.session.loggedUserIn = true
        req.session.user = response.user
        res.redirect('/user-home')
      }
      else {
        req.session.loginErr = "Invalid email or password";
        res.redirect('/')
      }
    })
  },
  userSignup: (req, res, next) => {
    if (req.session.loggedUserIn) {
      res.redirect('/user-home')
    } else {
      res.render('user/user-signup')
    }


  },
  signupForm: async (req, res, next) => {

    userHelper.doSignup(req.body).then((data) => {
      req.session.signupStatus = 'Account has created'
      res.redirect('/user-home')
    }).catch((err) => {
      req.session.signupErr = "Email already exist"
      res.redirect('/user-signup')
    })
  },
  getHome: (req, res) => {
    res.render('user/user-home', { user: req.session.user })
  },

  //otp validation

  otpValidateGet: (req, res) => {
    if (req.session.vid) {
      res.render('user/otp', { otpError: req.session.otpErr, mobile: req.session.mobile })
      req.session.otpErr = null;
    }
    else {
      res.redirect("/");
    }
  },
  otpValidatePost: (req, res) => {
    twilio.verifyOtp(req.session.mobile, req.body.otp).then((response) => {
      console.log(response)
      if (response.valid) {
        res.redirect('/');
      }
      else {
        req.session.otpErr = "Invalid otp.."
        res.redirect('user/otplogin')
      }
    })
  },
  loginWithOtpGet: (req, res) => {
    res.render('user/otplogin')
  },
  loginWithotppost: (req, res) => {
    console.log("sdf")
    let mobile = req.body.phone;
    req.session.mobile = mobile;
    console.log(req.body)
    userHelper.loginWithOTP(req.body).then((response) => {
      console.log(response)
      if (response.status) {
        twilio.generateOpt(mobile).then((verify) => {
          console.log("generate")
          req.session.vid = verify
          req.session.user = response.user;
          res.redirect('/otp')
        })
      }
      else if (response.block) {
        req.session.loginError = "Your accout is blocked by admin ";
        res.redirect('/user-login');
      }
      else {
        req.session.loginError = "Invalid phone number or password.."
        res.redirect('/user-login');
      }
    })
  },
  //user logout

  userlogOut: (req, res) => {
    req.session.loggedUserIn = false;
    req.session.user = null;
    req.session.destroy();
    res.redirect('/');
  },
}

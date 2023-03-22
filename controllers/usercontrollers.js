const { response } = require('express');
const session = require('express-session');
const { checkout } = require('../app');
const userHelper = require('../helpers/user-helpers');
const { doSignup } = require('../helpers/user-helpers');
let twilio = require('../middlewares/twilio');
const { subscribe } = require('../routes/user');

module.exports = {

  getindex: (req, res) => {
    res.render('user/index', { user: req.session.user })
  },

  userLogin: (req, res, next) => {
    if (req.session.loggedUserIn) {
      res.redirect('/user-home')
    } else {
      res.render('user/user-login', { Blocked: req.session.adminBlocked })
      req.session.adminBlocked = null;
    }
  },

  loginForm: (req, res) => {
    // console.log(req.body)
    userHelper.doLogin(req.body).then((response) => {
      console.log(response)
      if (response.blocked) {
        req.session.adminBlocked = "Your account is blocked by admin"
        res.redirect('/user-login')
      }
      else if (response.status) {
        req.session.loggedUserIn = true
        req.session.user = response.user
        console.log(req.session.user);
        res.redirect('/')
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
      let err = req.session.signupErr
      res.render('user/user-signup', { err })
      req.session.signupErr = false
    }
  },


  signupForm: async (req, res, next) => {
    userHelper.doSignup(req.body).then((data) => {
      if (data) {

        req.session.signupStatus = 'Account has created'
        res.redirect('/user-login')
      } else {
        req.session.signupErr = true
        res.redirect('/signUp')

      }
    })
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
  // use dash
  userProfileDash: (req, res) => {
    res.render('user/user-profile/user-account', { user: req.session.user });
  },

  //Cart ADD
  AddtoCart: (req, res) => {
    const productId = req.params.id
    const userId = req.session?.user._id
     console.log(productId);
     console.log(userId);
    userHelper.addcartget(userId, productId).then((response) => {
      res.json({ status: true })
    })
  },

  //GetCart
  userCartGet: async (req, res) => {
    const totalAmount = await userHelper.FindTotalAmount(req.session.user._id)
    const cartItems = await userHelper.getcartProducts(req.session.user._id)
    console.log(cartItems);
    const cartId = cartItems?._id
    res.render('user/user-cart', { cartItems, user: req.session.user, totalAmount, cartId })
  }, 

  //ChangeQuantity
  ChangeCartQuantity: (req, res) => {
    userHelper.ChangeQuantity(req.body).then(async (response) => {
      response.total = await userHelper.FindTotalAmount(req.body.userId);
      const subtotal = await userHelper.findSubTotal(req.body.userId)
      response.subtotal = subtotal;
      console.log(subtotal);
      res.json(response) 
    })
  },

  removeproducts:(req,res)=>{
    userHelper.removeCartProducts(req.body).then((response)=>{
      res.json(response)
    })
  },

  UserCheckout:(req,res)=>{
    res.render('user/checkout')
  }

}

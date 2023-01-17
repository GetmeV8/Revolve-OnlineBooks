var express = require('express');
const user_controller = require('../controllers/usercontrollers');
const page_controller = require('../controllers/pagecontroller');
const session_check = require('../middlewares/sessionhandilng');
const uservalidation = require('../validation/uservalidation');
var router = express.Router();

/* GET users listing. */


// user login page and post
router.route('/')
    .get(session_check.authenticationCheck, user_controller.userLogin)
    .post(user_controller.loginForm);

router.get('/user-home', user_controller.getHome)

// router.get('/signUp', user_controller.userSignup)

// router.post('/signUp',user_controller.formSubmit)

// user signup and post

router.route('/signUp').get(user_controller.userSignup).post(uservalidation.userSignUpValidate,user_controller.signupForm);


router.get('/signout', user_controller.userlogOut);

//validate otp
router.route('/otp').get(user_controller.otpValidateGet).post(user_controller.otpValidatePost);

//otp login
router.route('/otplogin').get(user_controller.loginWithOtpGet).post(user_controller.loginWithotppost);


router.get('/user-shop', page_controller.productListing );


router.get('/product-view/:id',page_controller.productView);





module.exports = router;

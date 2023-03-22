var express = require('express');
const user_controller = require('../controllers/usercontrollers');
const page_controller = require('../controllers/pagecontroller');
const session_check = require('../middlewares/sessionhandilng');
const uservalidation = require('../validation/uservalidation');
const usercontrollers = require('../controllers/usercontrollers');
var router = express.Router();

/* GET users listing. */


//user indexpage
router.get('/',user_controller.getindex);

// user login page and post
router.route('/user-login').get(session_check.userauthenticationCheck, user_controller.userLogin).post(user_controller.loginForm);

//userhomepage

// user signup and post

router.route('/signUp').get(user_controller.userSignup).post(uservalidation.userSignUpValidate,user_controller.signupForm);


router.get('/signout', user_controller.userlogOut);

//validate otp
router.route('/otp').get(user_controller.otpValidateGet).post(user_controller.otpValidatePost);

//otp login
router.route('/otplogin').get(user_controller.loginWithOtpGet).post(user_controller.loginWithotppost);

//User-Shop Page
router.get('/user-shop', page_controller.productListing );

//view products details
router.get('/product-view/:id',page_controller.productView);

//get Cart
router.get('/user-cart',session_check.isUserExist,user_controller.userCartGet);
 
// add to cart
router.get('/add-to-cart/:id',session_check.isUserExist,user_controller.AddtoCart);

//changeQuantity
router.post('/change-quantity', user_controller.ChangeCartQuantity);

//removeproductsfromcart
router.put('/remove-cart-product',user_controller.removeproducts);

//Checkout
router.get('/checkout',user_controller.UserCheckout);

//userprofile
//user dash
router.get('/user-account',session_check.isUserExist,user_controller.userProfileDash);


//addressmanagement




module.exports = router;

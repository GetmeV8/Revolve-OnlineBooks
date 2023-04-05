var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/usercontrollers');
const page_controller = require('../controllers/pagecontroller');
const session_check = require('../middlewares/sessionhandilng');
const uservalidation = require('../validation/uservalidation');
const usercontrollers = require('../controllers/usercontrollers');
const { isUserExist } = require('../middlewares/sessionhandilng');



/* GET users listing. */


//user indexpage
router.get('/', user_controller.getindex);

// user login page and post
router.route('/user-login').get(session_check.userauthenticationCheck, user_controller.userLogin).post(user_controller.loginForm);

//userhomepage

// user signup and post
router.route('/signUp').get(user_controller.userSignup).post(uservalidation.userSignUpValidate, user_controller.signupForm);


router.get('/signout', user_controller.userlogOut);

//validate otp
router.route('/otp').get(user_controller.otpValidateGet).post(user_controller.otpValidatePost);

//otp login
router.route('/otplogin').get(user_controller.loginWithOtpGet).post(user_controller.loginWithotppost);

//User-Shop Page
router.get('/user-shop', page_controller.productListing);

//view products details
router.get('/product-view/:id', page_controller.productView);

//get Cart
router.get('/user-cart', session_check.isUserExist, user_controller.userCartGet);

// add to cart
router.get('/add-to-cart/:id', session_check.isUserExist, user_controller.AddtoCart);

//changeQuantity
router.post('/change-quantity', user_controller.ChangeCartQuantity);

//removeproductsfromcart
router.put('/remove-cart-product', user_controller.removeproducts);

//userprofilemanagement
router.get('/user-account', session_check.isUserExist, user_controller.userProfileDash);

//addressmanagement
router.route('/AddressManagement').post(user_controller.AddaddressPost);
router.route('/Editaddress').post(user_controller.EditAddresspost).get(user_controller.EditAddressget);//not completed
router.post('/address-delete',user_controller.deleteAddress);

//ordermanagement
router.get('/orders',user_controller.userOrders);
router.get('/view-order-products/:id',usercontrollers.viewOrders)

//Checkout
router.get('/checkout', session_check.isUserExist, user_controller.UserCheckout);
router.post('/order-placed',user_controller.Orderplacementpost)

//landing page
router.get('/order-placed-landing',session_check.isUserExist,user_controller.orderPlacedLanding)

//wishlist
router.get('/add-to-wishlist/:id', session_check.isUserExist, user_controller.addtoWishlist);
router.get('/wishlist', session_check.isUserExist, user_controller.wishlistGet);

//razorpay
router.post('/verify-payment',user_controller.verifyPayment);

module.exports = router;
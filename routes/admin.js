var express = require('express');
var router = express.Router();
const admin_controller = require('../controllers/admincontrollers');
const page_controller = require('../controllers/pagecontroller')
let adminauth = require('../middlewares/sessionhandilng');

/* GET home page. */

// const admin = {
//   email: 'rameez@admin.com',
//   password: 'administrator',
// }

// router.route('/admin-login').get(admin_controller.adminLogin).post(admin_controller.adminPost);

router.get('/', admin_controller.adminLogin)

router.post('/admin-login',admin_controller.adminPost);

router.get('/admin-dash',admin_controller.adminDash);

router.get('/allusers',admin_controller.allUsers);

router.get('/user-block/:id', admin_controller.userBlocking);

router.get('/user-unblocking/:id', admin_controller.userUnblocking);

router.get('/addproduct',admin_controller.addProduct);

router.post('/adminAddProducts',admin_controller.adminAddProductPost)

router.get('/productslist',admin_controller.productList);

router.get('/editproduct/:id',admin_controller.productEdit);

router.post('/productUpdate/:id',admin_controller.productUpdate);

router.get('/category',admin_controller.addcategoryGet);

router.post('/addcategoryPost',admin_controller.addcategoryPost);





module.exports = router;

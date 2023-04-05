var express = require('express');
var router = express.Router();
const admin_controller = require('../controllers/admincontrollers');
const page_controller = require('../controllers/pagecontroller')
let adminauth = require('../middlewares/sessionhandilng');
const adminvalidation = require('../validation/adminvalidation');
const multer = require('multer');
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname)
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".webp") {
            cb(new Error("File type is not supported"), false)
            return
        }
        cb(null, true)
    }
})

/* GET home page. */

// const admin = {
//   email: 'rameez@admin.com',
//   password: 'administrator',
// }


router.route("/").get(admin_controller.adminLoginGet).post(adminvalidation.adminLoginValidate, admin_controller.adminLoginPost)

router.get('/logOut', admin_controller.logoutAdmin);

router.get('/admin-dash', admin_controller.adminDash);

router.get('/allusers', admin_controller.allUsers);

router.get('/user-block/:id', admin_controller.userBlocking);

//user blocking unblocking
router.get('/user-unblocking/:id', admin_controller.userUnblocking);

//Add Product
router.get('/addproduct', admin_controller.addProduct);

//Image Upload Multer
router.post('/adminAddProducts',
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },

    ]),
    admin_controller.adminAddProductPost);


//Products list
router.get('/productslist', admin_controller.productList);

//edit product
router.get('/editproduct/:id', admin_controller.productEdit);

//product Edit post
router.post('/productUpdate/:id', admin_controller.productUpdate);

//category get
router.get('/category', admin_controller.addcategoryGet);

//category post
router.post('/addcategoryPost', admin_controller.addcategoryPost);

//coupon get
router.get('/add-coupon',admin_controller.couponGet);


module.exports = router;

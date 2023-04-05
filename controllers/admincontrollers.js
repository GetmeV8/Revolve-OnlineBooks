const adminHelper = require('../helpers/admin-helpers')
const product_helper = require('../helpers/product-helpers')
const { response, json } = require('express');
const multer = require('multer');
const path = require('path');
var cloudinary = require('../utils/cloudinary');
const { validationResult } = require('express-validator')

module.exports = {

    // adminLogin: (req, res, next) => {
    //     let admin = req.session.admin;
    //     console.log('loginadmin')
    //     res.render('admin/admin-login', { admin, 'adminLoginErr': req.session.adminLoginErr });
    //     req.session.adminLoginErr = false
    // },

    adminLoginGet: (req, res) => {
        const { admin, loginError } = req.session
        if (admin) {
            return res.redirect("/admin/admin-dashb")
        }
        res.render("admin/admin-login", { loginErr: loginError })
        req.session.loginError = null
    },

    logoutAdmin: (req, res) => {
        req.session.admin = null
        res.redirect("/admin")
      },

    // admin login post
    adminLoginPost: async (req, res) => {
        try {
          const response = await adminHelper.adminLogin(req.body)
          console.log(response);
          if (response.status) {
            req.session.adminLoggedIn = true
            req.session.admin = response.admin
            res.json({ status: true })
          } else if (response.notExist) {
            req.session.loginError = "Invalid email address..."
            res.json({ status: false })
          } else {
            req.session.loginError = "Incorrect password "
            res.json({ status: false })
          }
        } catch (error) {
          console.error(error)
          res.status(500).json({ error: "Server Error" })
        }
      },
    //admin dashboard
    adminDash: (req, res) => {
        let admin = req.session.admin;
        res.render('admin/admin-dash', { admin });
    },


    //all users
    allUsers: (req, res) => {
        adminHelper.allUsers().then((userInfo) => {
            //  userInfo = JSON.parse(JSON.stringify(userInfo))
            let admin = req.session.admin;
            res.render('admin/allusers', { admin, userInfo })
        })
    },
    //UserBlocking
    userBlocking: (req, res) => {
        let userId = req.params.id;
        console.log(userId)
        adminHelper.blockUsers(userId).then((status) => {
            console.log('user blocked');
            res.redirect('/admin/allusers')
        })
    },
    userUnblocking: (req, res) => {
        let userId = req.params.id;
        adminHelper.unblockUser(userId).then((status) => {
            console.log('user unblocked');
            res.redirect('/admin/allusers')
        })
    },

    addProduct: (req, res) => {
        adminHelper.getallCategories().then((category) => {
            console.log(category)
            res.render('admin/addproduct', { admin: true, category });
        })
        req.session.productStatus = false;
    },


    productList: (req, res) => {
        adminHelper.viewProduct().then((products) => {
            // console.log(products);
            res.render('admin/productslist', { admin: true, products })
        })
    },
    adminAddProductPost: async (req, res) => {
        console.log(req.body);
        console.log(req.files)
        const cloudinaryImageUploadMethod = (file) => {
            console.log("qqqq");
            return new Promise((resolve) => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err)
                        console.log(err, "sssssssssssssssssssssssss");
                    resolve(res.secure_url)
                })
            })
        }

        const files = req.files
        let arr1 = Object.values(files)
        let arr2 = arr1.flat()
        const urls = await Promise.all(
            arr2.map(async (file) => {
                const { path } = file
                const result = await cloudinaryImageUploadMethod(path)
                return result
            })
        )
        adminHelper.addProduct(req.body, urls).then((err) => {
            if (!err) {
                res.redirect('/admin/addproduct')
            } else {
                console.log(err)
                res.redirect('/admin/addproduct')
            }
        })


    },
    productEdit: (req, res) => {
        let productId = req.params.id;
        console.log(req.params.id)
        adminHelper.editProduct(productId).then((document) => {
            console.log(document)
            res.render("admin/editproduct", { array: document[0] });

        })
    },
    // productEdit:(req,res)=>{
    //     const productId = req.params.id  
    //        adminHelper.editProduct(productId).then((document)=>{
    //         res.render('admin/editproduct',{
    //             document,
    //             productStatus:req.session.updateProductStatus,
    //             updateErr:req.session.updateProductError,
    //             updateMsg:req.session.updateMsg
    //         })
    //        })
    // },
    productUpdate: async (req, res) => {
        const id = req.params.id;
        const obj = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category
        };
        await adminHelper.updateProduct(id, obj).then((status) => {
            console.log(status)
            if (!status) {
                res.send('error');
            } else {
                if (req.files) {
                    let img = req.files.image;
                    img.mv('./public/image-products/' + id + '.jpg', err => {
                        if (!err) res.redirect('/admin/productslist')
                        else console.log(err);
                    });
                    return;
                }
                res.redirect("/admin/productslist")
            }
        })
    }, addcategoryGet: (req, res) => {
        adminHelper.getallCategories().then((category) => {
            res.render('admin/category',
                { admin: true, category, deletedCategory: req.session.categoryDeleted, addedCategory: req.session.addedCategory })
            req.session.categoryDeleted = null;
            req.session.addedCategory = null;
        })
    }, addcategoryPost: (req, res) => {
        adminHelper.addCategories(req.body).then((data) => {
            req.session.addedCategory = "category added successfully"
            res.redirect('/admin/category');
        })
    }, categoryListing: (req, res) => {
        let category = req.params.id;
        adminHelper.allCategory().then(category)
    },
    // add coupon
    couponGet:(req,res)=>{
       
        adminHelper.viewProduct().then((products) => {
            // console.log(products);
            res.render('admin/add-coupon', {  products })
        })
    },
}

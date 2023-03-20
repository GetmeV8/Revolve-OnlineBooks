const adminHelper = require('../helpers/admin-helpers')
const product_helper = require('../helpers/product-helpers')
const { response, json } = require('express');

module.exports = {

    adminLogin: (req, res, next) => {
        let admin = req.session.admin;
        console.log('loginadmin')
        res.render('admin/admin-login', { admin, 'adminLoginErr': req.session.adminLoginErr });
        req.session.adminLoginErr = false


    },
    // admin login post
    adminPost: (req, res, next) => {
        adminHelper.doLogin(req.body).then((data) => {
            console.log(data)
            if (data.name) {
                console.log("admin dash")
                req.session.admin = data;
                req.session.adminStatus = true;
                res.redirect('/admin/admin-dash')
            }
            else {
                console.log("admin login failed")
                req.session.adminLoginErr = "Invalid Admin Email Or Password";
                res.redirect('/admin/admin-login')
            }
        })
    },
    //admin dashboard
    adminDash: (req, res) => {
        let admin = req.session.admin;
        res.render('admin/admin-dash',{admin});
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
    adminAddProductPost: (req, res) => {
        console.log(req.body);
        console.log(req.files)
        adminHelper.addProduct(req.body).then((data) => {
            console.log(data)
            let image = req.files.image;
            console.log(image);
            let objId = data.insertedId;
            image.mv('./public/image-products/' + objId + '.jpg', err => {
                if (!err) {
                    res.redirect('/admin/addproduct')
                } else {
                    console.log(err)
                    res.redirect('/admin/addproduct')
                }
            })
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

}
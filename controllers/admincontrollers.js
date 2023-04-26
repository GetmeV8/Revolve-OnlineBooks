const adminHelper = require('../helpers/admin-helpers')
const product_helper = require('../helpers/product-helpers')
const { response, json } = require('express');
const multer = require('multer');
const path = require('path');
const voucher_codes = require('voucher-code-generator');
var cloudinary = require('../utils/cloudinary');
const { validationResult } = require('express-validator');

module.exports = {


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
    // adminDash: (req, res) => {
    //     let admin = req.session.admin;
    //     let category = adminHelper.allCategory().then((category) => {
    //         res.render('admin/admin-dash', { admin, category });
    //     })

    // },

    adminDash: async (req, res) => {
        try {
            const [totalRevenue, totalOrders, totalProducts, monthlyEarnings] =
                await Promise.allSettled([
                    adminHelper.calculateTotalRevenue(),
                    adminHelper.calculateTotalOrders(),
                    adminHelper.calculateTotalNumberOfProducts(),
                    adminHelper.calculateMonthlyEarnings(),
                ]).then((results) =>
                    results
                        .filter((result) => result.status === "fulfilled")
                        .map((result) => result.value)
                )
            res.render("admin/admin-dash", {
                totalRevenue,
                totalOrders,
                totalProducts,
                monthlyEarnings,
            })
            console.log(monthlyEarnings);
        } catch (error) {
            res.render("error", { message: "Error fetching dashboard data" })
        }
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
    productEdit: async (req, res) => {
        let productId = req.params.id;
        let category = await adminHelper.allCategory()
        console.log(req.params.id)
        adminHelper.editProduct(productId).then((document) => {
            console.log(document)
            res.render("admin/editproduct", { array: document[0], category });

        })
    },
    productUpdate: async (req, res) => {
        id = req.params.id;
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
        adminHelper.updateProduct(id, req.body, urls).then((err) => {
            if (!err) {
                console.log("+++");
                res.redirect('/admin/productslist')
            } else {
                console.log(err)
                res.redirect('/admin/productslist')
            }
        })
    },
    addcategoryGet: async (req, res) => {
        try {
            const category = await adminHelper.getallCategories()
            res.render("admin/category", {
                category,
                response :req.session.categoryResponse,
                deletedCategory: req.session.categoryDeleted,
            })
            req.session.categoryDeleted = req.session.addedCategory = null
            req.session.categoryResponse = null
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    },
    addcategoryPost: (req, res) => {
        try {
            const { body } = req
            adminHelper.addCategories(body).then((response) => {
                req.session.categoryResponse = response
                res.redirect("/admin/category")
            })
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    },
    categoryListing: (req, res) => {
        let category = req.params.id;
        adminHelper.allCategory().then(category)
    },
    editCategoryGet: (req, res) => {
        try {
            const { id } = req.params
            adminHelper.getCurrentCategory(id).then((category) => {
                res.render("admin/edit-category", { category })
            })
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error")
        }
    },
    editCategoryPut: async (req, res) => {
        try {
            const { id } = req.params;
            await adminHelper.updateCurrentCategory(id, req.body);
            res.redirect("/admin/category");
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");
        }
    },

    //orderList
    orderList: async (req, res) => {
        const orders = await adminHelper.getAllUserOrders()
        res.render('admin/orderlist', { orders })
    },
    changeProductStatus: (req, res) => {
        adminHelper.changeOrderStatus(req.body).then(() => {
            res.redirect("/admin/orderlist")
        })
    },
    viewOrderDetails: async (req, res) => {
        const orderDetails = await adminHelper.getCurrentProducts(req.params.id)
        console.log(orderDetails)
        res.render("admin/view-more-orders", { orderDetails })
    },
    // add coupon
    couponGet: async (req, res) => {
        const products = await adminHelper.viewProduct();
        adminHelper.allCategory().then((category) => {
            console.log(category);
            res.render('admin/add-coupon', { admin: true, category, products })
        })
    }, couponPost: (req, res) => {
        console.log(req.body);
        adminHelper.createCoupon(req.body).then(() => {
            res.redirect('/admin/add-coupon');
        });
    },
    codeGenerator: (req, res) => {
        const code = voucher_codes.generate({
            length: 6,
            count: 1,
            charset: '012345ABCDE',
        });
        res.json(code[0]);
    },

    viewCoupon: (req, res) => {
        res.render('admin/view-coupons')
    },
    getChartData: async (req, res) => {
        try {
            const currentDate = new Date()
            const formattedCurrDay = currentDate.toISOString().slice(0, 10) // "YYYY-MM-DD"
            const firstDayOfMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            )
            const formattedFirstDay = firstDayOfMonth.toISOString().slice(0, 10) // "YYYY-MM-DD"
            const chartData = await adminHelper.mostSellingProducts(formattedFirstDay, formattedCurrDay)

            res.json({ chartData })
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    },
    getData: async (req, res) => {
        try {
            const [sales, products, visitors, orderStat, paymentStat] =
                await Promise.allSettled([
                    adminHelper.calculateMonthlySalesForGraph(),
                    adminHelper.NumberOfProductsAddedInEveryMonth(),
                    adminHelper.orderStatitics(),
                    adminHelper.paymentStat(),
                ]).then((results) =>
                    results
                        .filter((result) => result.status === "fulfilled")
                        .map((result) => result.value)
                )
            const response = {
                sales,
                products,
                visitors,
                orderStat,
                paymentStat,
            }
          //  console.log(response);
            res.json(response)
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    },




    refundAmount: async (req, res) => {
        try {
          const { orderId } = req.body
         // console.log(req.body);
          const result = await adminHelper.refundAmont(req.body)
         // console.log(result);
          if (result.modifiedCount === 1) {
            adminHelper.updateRefundStatus(orderId)
            res.json({ status: true })
          } else {
            res.json({ status: false })
          }
        } catch (error) {
          res.status(500).send("Internal Server Error")
        }
      },

  



    

}

var db = require('../config/connection')
var collection = require('../config/collections')
const session = require('express-session');
const { checkout, use, response } = require('../app');
const userHelper = require('../helpers/user-helpers');
const { doSignup } = require('../helpers/user-helpers');
let twilio = require('../middlewares/twilio');
const { subscribe } = require('../routes/user');
const { validationResult } = require('express-validator');
const adminHelpers = require('../helpers/admin-helpers');
const { getTotalPrice } = require('../utils/getcart')

module.exports = {

  getindex: (req, res) => {
    console.log(">>>>>>>>>>>>>>><<<<<<<<<")
    res.render('user/index', { user: req.session.user })
  },
  userLogin: (req, res) => {
    try {
      console.log(req.session);
      if (req.session.user) {
        res.redirect('/')
      } else {
        res.render('user/user-login', { Blocked: req.session.adminBlocked })
        req.session.loginError = null
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },
  loginForm: async (req, res) => {
    try {
      const errors = validationResult(req)
      const successResponse = {
        status: true
      }
      const err = errors.errors
      req.session.mobile = req.body.mobile
      if (err.length === 0) {
        const response = await userHelper.doLogin(req.body)
        if (response.block) {
          req.session.loginError = 'Your account is blocked by admin'
          res.json({ status: false })
        } else if (response.status) {
          req.session.loggedUserIn = true
          req.session.user = response.user
          // console.log(response);
          // console.log(req.session)
          res.json({ response })
        }
        else {
          req.session.loginError = 'Invalid phone number or password'

          res.json({ response: { status: false } })
        }
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  },


  userSignup: (req, res, next) => {
    try {
      if (req.session.user) {
        res.redirect('/')
      } else {
        console.log(req.session.err)
        res.render('user/user-signup', { signUpErr: req.session.signUpErr, errors: req.session.err })
        req.session.signUpErr = null
        req.session.err = null
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Errrr')
    }
  },


  signupForm: async (req, res, next) => {
    try {
      const errors = validationResult(req)
      req.session.err = errors.errors
      console.log(req.session.err)
      const { email, phone } = req.body
      if (req.session.err.length === 0) {
        const response = await userHelper.doSignup(req.body)
        if (response.email === email) {
          req.session.signUpErr = `${response.email} already exists please login`
          res.json({ status: false })
        } else if (response.phone === phone) {
          req.session.signUpErr = `${response.phone} already exists please login`
          res.json({ status: false })
        } else {
          res.redirect('/signUp')
          // res.json({ status: false })
        }
      } else {
        res.redirect('/signUp')
      }
    } catch (error) {
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
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
  //   loginWithotppost:async(req, res) => {
  //   try {
  //     let mobile = req.body.phone;
  //     req.session.mobile = mobile
  //     const response = await userHelper.loginWithOTP(req.body)
  //     if (response.status) {
  //       const verify = await generateOpt(mobile)
  //       req.session.vid = verify
  //       req.session.user = response.user
  //       res.redirect("/otp")
  //     } else if (response.block) {
  //       req.session.loginError = "Your account is blocked by admin"
  //       res.redirect("/user-login")
  //     } else {
  //       req.session.loginError = "Invalid phone number or password.."
  //       res.redirect("/user-login")
  //     }
  //   } catch (error) {
  //     res.render("users/user-login", {
  //       warningMessage: "Internal Server Error Please try again later...",
  //     })
  //   }
  // },

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
  userProfileDash: async (req, res) => {
    const userId = req.session.user._id;
    const addresses = await userHelper.getUserAdresses(userId);
    let orders = await userHelper.getOrdered(req.session.user._id)
    const walletData = await userHelper.getWalletData(req.session.user._id)
    orders = orders.reverse()
    // console.log("0000000000000000", orders);
    // console.log(addresses);
    res.render('user/user-profile/user-account', { user: req.session.user, addresses, orders, walletData });
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
    const cartItems = await userHelper.getcartProducts(req.session.user._id)
    let totalAmount = 0
    if (cartItems?.length > 0) {
      totalAmount = await userHelper.FindTotalAmount(req.session.user._id)
    }
    console.log(cartItems);
    const cartId = cartItems?._id
    res.render('user/user-cart', { cartItems, user: req.session.user, totalAmount, cartId })
  },

  //ChangeQuantity
  ChangeCartQuantity: async (req, res) => {
    try {
      const { userId } = req.body
      const response = await userHelper.ChangeQuantity(req.body)
      console.log(response)
      response.total = await userHelper.FindTotalAmount(userId)
      const subtotal = await userHelper.findSubTotal(userId)
      response.subtotal = subtotal
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json("Internal Server Error")
    }
  },
  //ProductRemoval
  removeproducts: async (req, res) => {
    try {
      const response = await userHelper.removeCartProducts(req.body);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  //UserCheckout
  UserCheckout: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const totalAmount = await userHelper.FindTotalAmount(req.session.user._id);
      const cartItems = await userHelper.getcartProducts(req.session.user._id);
      const addresses = await userHelper.getUserAdresses(userId);
      const coupons = await userHelper.getAllCoupons();
      const cartId = cartItems?._id;
      console.log(req.body);
      // console.log("<<|>>",coupons);
      res.render('user/checkout', { cartItems, user: req.session.user, totalAmount, cartId, addresses, coupons });
    } catch (err) {
      console.log(err);
      res.render('error', { message: 'An error occurred while processing your request' });
    }
  },
  AddaddressPost: async (req, res) => {
    try {
      const userId = req.session.user?._id
      req.body.userId = userId
      await userHelper.addNewAddress(req.body)
      res.redirect('/user-account');
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: true, message: 'Error occurred while adding address' })
    }
  },

  EditAddressget: async (req, res) => {
    try {
      const currentAddress = await userHelper.getcurrentAddress(req.query.id)
      res.render('user/editaddress', { currentAddress })
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: 'Internal error' })
    }
  },
  EditAddresspost: async (req, res) => {
    try {

      userHelper.editAddress(req.query.addressId, req.body).then(() => {
        req.session.updatedAddr = 'Successfully updated address';
        res.redirect('/user-account');
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  deleteAddress: (req, res) => {
    const { addressId } = req.body
    try {
      userHelper.addressDelete(addressId)
      res.redirect('/user-account')
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  Orderplacementpost: async (req, res) => {
    try {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', req.body);
      const { payment_method } = req.body
      let products = await userHelper.getCartProductList(req.body.userId);
      let totalPrice = await userHelper.FindTotalAmount(req.body.userId);
      if (req.session.coupon) {
        const { code, priceAfterDiscount } = req.session.coupon
        console.log('discount razorpay ')
        totalPrice = { total: priceAfterDiscount }
      }
      let address = await userHelper.getcurrentAddress(req.body.addressid);
      console.log(products, "???");
      let orderId = await userHelper.placeOrder(req.body, products, totalPrice, address);
      console.log(">>>>", req.body);
      if (payment_method === 'cod') {
        res.json({ cod: true });
      } else if (payment_method === 'wallet') {
        const walletDetails = await userHelper.getWalletData(
          req.session.user?._id
        )
        console.log("$$$$", walletDetails);
        walletDetails.wallet = true
        walletDetails.total = totalPrice
        req.session.walletInfo = { orderId, totalPrice }
        res.json(walletDetails)
      } else {
        const response = await userHelper.generateRazorpay(orderId, totalPrice)
        console.log("?????", response);
        res.json(response)
      }
      console.log(req.body);
    } catch (error) {
      console.log(error);
      res.json({ status: false, message: error.message });
    }
  },

  userOrders: async (req, res) => {
    try {
      const orders = await userHelper.getUserOrders(req.session.user._id)
      res.render('user/orders', { user: req.session.user, orders })
    } catch (error) {
      console.error(error)
      res.render('error', { message: 'Error fetching user orders' })
    }
  },

  viewOrders: async (req, res) => {
    try {
      console.log('///////////////');
      let products = await userHelper.getOrderProducts(req.params.id)
      res.render('user/orders', { user: req.session.user, products })
    } catch (error) {
      console.log(error)
      res.render('error', { message: "error fetching the order data" })
    }
  },

  orderdetailGet: async (req, res) => {
    try {
      const orderId = req.params.id
      const orderDetails = await userHelper.getCurrentUserOrders(req.params.id)
      console.log(orderDetails.products);
      res.render("user/order-details", { orderDetails })
    } catch (error) {
      res.render("user/order-details", {
        warningMessage: "Internal Server Error",
      })
    }
  },
  cancelOrders: (req, res) => {
    try {
      const { orderId } = req.body
      userHelper.cancelUserOrder(orderId).then(() => {
        res.redirect("/orders")
      })
    } catch (error) {
      res.render("user/user-shop", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },
  verifyPayment: (req, res) => {
    // console.log(req.body['payment[receipt]'])
    userHelper.verifyRazorpayPayments(req.body).then(() => {
      userHelper.changepaymentStatus(req.body['payment[receipt]']).then(() => {
        console.log('payment successfull');
        res.json({ status: true })
      })
    }).catch((error) => {
      console.log(error);
      res.json({ status: false })
    })
  },
  getWallet: async (req, res) => {
    try {
      const walletData = await userHelper.getWalletData(req.session.user._id)
      if (walletData) {
        walletData.transactions = walletData.transactions ? walletData.transactions : []
      }
      console.log(walletData)
      res.render("user/user-profile/user-account", { walletData, user: req.session.user })
    } catch (error) {
      console.log(error)
      res.render("users/wallet", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },

  activateWallet: async (req, res) => {
    try {
      const user = req.session.user
      const response = await userHelper.activateWallet(user)
      response.acknowledged
        ? res.status(200).json(response)
        : res.status(403).json(response)
    } catch (error) {
      res.render("user/wallet", {
        warningMessage: "Internal Server Error Please try again later...",
      })
    }
  },


  walletPayment: async (req, res) => {
    try {
      const { totalPrice, orderId } = req.session.walletInfo
      const userId = req.session.user._id
      const response = await userHelper.getUserWallet(
        orderId,
        totalPrice,
        userId
      )
      console.log(response)
      const coupon = await userHelper.calculateCouponDiscount(totalPrice, userId)
      response.coupon = coupon
      res.json(response)
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, errorMsg: "Something went wrong" })
    }
  },




  getOffers: (req, res) => {
    if (req.session.users) {
      let user = req.session.users
      adminHelpers.getAllCoupons().then((offers) => {
        res.render('user/offers', { user: true, user, offers, page: 'OFFERS' });
      }).catch(() => {
        res.render('user/offers', { user: true, user, page: 'OFFERS' });
      });
    } else {
      adminHelpers.getAllCoupons().then((offers) => {
        res.render('user/offers', {
          user: 'Login', guest: true, offers, page: 'OFFERS',
        });
      }).catch(() => {
        res.render('user/offers', { user: 'Login', guest: true, page: 'OFFERS' });
      });
    }
  },

  getCoupon: async (req, res) => {
    try {
      const total = await userHelper.FindTotalAmount(req.session.user._id);
      console.log("666", total);
      const response = await userHelper.calculateCouponDiscount(total.total, req.body.data)
      console.log(response)
      if (response) {
        req.session.coupon = response
        res.status(200).json(response)
      } else {
        res.status(403).json(response)
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ Message: "Internal server error" })
    }

  },

  orderPlacedLanding: (req, res) => {
    try {
      res.render('user/order-placed-landing')
      req.session.coupon = null
      // req.session.couponAppliedDetails = null 
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  // addToWishList: async (req, res) => {
  //   try {
  //     if (req.session.user) {
  //       const { productId } = req.params
  //       const userId = req.session.user?._id
  //       const response = await userHelper.addToWhishList(productId, userId)
  //       response.status = true, res.json(response)
  //     } else {
  //       res.json({ status: false })
  //     }
  //   }
  //   catch (error) {
  //     res.status(500).json({ Message: "Internal server error" })
  //   }
  // },
  // userWishlistGet: async (req, res) => {
  //   try {
  //     const userId = req.session.user._id
  //     const wishItems = await userHelper.getProductsDetailsOfWishList(userId)
  //     res.render("user/wishlist", {
  //       wishItems, user: userId
  //     })
  //   } catch (error) {
  //     res.render("user/wishlist", {
  //       warningMessage: "Internal Server Error Please try again later...",
  //     })
  //   }
  // },

  removeProducts: async (req, res) => {
    try {
      const { productId } = req.params
      const userId = req.session.user._id
      const response = await userHelper.removeProducts(productId, userId)
      console.log(response);
      res.json(response)
    } catch (error) {
      res.status(500).json("Internal Server Error")
    }
  },

  addtoWishlist: (req, res) => {
    const productId = req.params.id
    const userId = req.session?.user._id
    console.log(productId);
    console.log(userId);
    userHelper.wishlistget(userId, productId).then((response) => {
      res.json({ status: true })
    })
  },

  wishlistGet: async (req, res) => {
    const wishlisted = await userHelper.getwishlistProducts(req.session.user._id)
    let totalAmount = 0
    if (wishlisted?.length > 0) {
      totalAmount = await userHelper.FindTotalAmount(req.session.user._id)
    }
    const wishlistId = wishlisted?._id
    res.render('user/wishlist', { wishlisted: wishlisted[0]?.products, user: req.session.user, totalAmount, wishlistId })
  },
  productsearch: async (req, res) => {
    try {
      let { search: name } = req.query;
      name = name.trim();
      console.log('name:' + name);
      const user = req.session.user;
      const db = client.db('your-db-name');
      let activeCategories = await adminHelpers.allCategory();
      await db.get()
      .collection(collection.PRODUCT_COLLECTION).find({ name: { $regex: new RegExp('^' + name + '.*', 'i') } })
        .limit(10)
        .toArray (async function (err, searchResult) {

          console.log('Search Result:' + searchResult);
          res.render('user/searchresult', {
            searchResult,
            activeCategories,
          });
        });
    } catch (error) {
      res.render('error');
  }
  },

}
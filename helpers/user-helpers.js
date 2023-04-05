var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
let twilio = require('../middlewares/twilio')
const { ObjectId } = require('mongodb');
const { CART_COLLECTION } = require('../config/collections');
const Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
    key_id: "rzp_test_KR2oW5tjBzSx0y",
    key_secret: 'MqvVFvT9J9tsVMsEojRCOcZ0',
});


module.exports = {
    // doSignup: (userdata) => {

    //     return new Promise(async (resolve, reject) => {

    //         let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.email })
    //         // console.log(user)
    //         // let regUser = {}
    //         if (user) {
    //             console.log("email already exsist")
    //             // regUser.status = true;
    //             resolve(false)
    //         }
    //         else {
    //             userdata.access = true
    //             console.log(userdata.password)
    //             userdata.password = await bcrypt.hash(userdata.password, 10)
    //             // .then((hash)=>{
    //             //     console.log(hash)
    //             // }).catch((err)=>{
    //             //     console.log(err);
    //             // })
    //             await db.get().collection(collection.USER_COLLECTION).insertOne(userdata)
    //             console.log("document inserted successfully")

    //             resolve(true)
    //         }
    //     })

    // },
    doSignup: async (userData) => {
        const { password, email, phone } = userData
        userData.active = true
        try {
            userData.password = await bcrypt.hash(password, 10)
            const checkedEmail = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ email })
            const phoneNumber = await db
                .get()
                .collection(collection.USER_COLLECTION)
                .findOne({ phone })
            if (checkedEmail) {
                return checkedEmail
            } else if (phoneNumber) {
                return phoneNumber
            } else {
                const result = await db
                    .get()
                    .collection(collection.USER_COLLECTION)
                    .insertOne(userData)
                return { status: true, userData: result.insertedId }
            }
        } catch (error) {
            console.log(error)
            return error
        }
    },
    // doLogin: (userdata) => {
    //     return new Promise(async (resolve, reject) => {
    //         console.log(userdata)
    //         let response = {}
    //         let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.name })
    //         console.log(user)
    //         if (!user.access) {
    //             resolve({ blocked: true })
    //         }
    //         else if (user) {
    //             bcrypt.compare(userdata.password, user.password).then((status) => {
    //                 if (status) {
    //                     response.user = user;
    //                     response.status = true;
    //                     resolve(response)
    //                 }
    //                 else {
    //                     resolve({ status: false })
    //                 }
    //             })
    //         }
    //         else {
    //             resolve({ status: false })
    //         }
    //     })
    // },
    doLogin: async (userdata) => {
        const { password, phone } = userdata
        console.log(password,phone)
        console.log(userdata);
        try {
          const response = {}
          const user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ phone })
        //   if (!user?.active) {
        //     response.block = true
        //     return response
        //   }
          if(!user?.active){
            return {
                block:true
            }
          }
          if (user) {
            const status = await bcrypt.compare(password, user.password)
            if (status) {
              response.user = user
              response.status = true
              return response
            } else { 
              return { incorrectPassword: "Wrong password" }
            }
          } else {
            console.log(userdata);
            return { loginError: false }
          }
        } catch (error) {
          console.log(error)
        }
      },
    loginWithOTP: (userData) => {
        return new Promise(async (res, rej) => {
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.phone })
            if (user.active) {
                response.block = true;
                res(response)
            }
            else if (user) {
                response.user = user;
                response.status = true;
                res(response);
            }
            else {
                console.log("login failed");
                res({ loginError: false });
            }
        })
    },
    addcartget: async (userId, productId) => {
        const product = {
            item: ObjectId(productId),
            quantity: 1
        }
        try {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            if (userCart) {
                const isProductExist = userCart?.products.findIndex(product => {
                    return product.item === productId
                })
                if (isProductExist !== -1) {
                    await db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ userId: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            })
                } else {
                    const response = await db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                        $push: {
                            products: product
                        }
                    })
                    return response
                }
            } else {
                console.log('new cart created')
                const cart = {
                    userId: ObjectId(userId),
                    products: [product]
                }
                await db.get().collection(collection.CART_COLLECTION).insertOne(cart)
                console.log('added product into the cart')
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },


    getCartProductsCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            const count = userCart?.products.length
            resolve(count)
        })
    },


    // ChangeQuantity: ({ cartId, productId, count, quantity }) => {
    //     return new Promise((resolve, reject) => {
    //         count = parseInt(count)
    //         quantity = parseInt(quantity)
            
    //         if (count === -1 && quantity === 1) {
    //             db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
    //                 {
    //                     $pull: { products: { item: ObjectId(productId) } }
    //                 }).then(() => {
    //                     resolve({ removed: true })
    //                 })
    //         } else if(count>0&&quantity){

    //         }else{
    //             console.log("updated");
    //             db.get().collection(collection.CART_COLLECTION).
    //                 findOneAndUpdate({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) },
    //                     {
    //                         $inc: { 'products.$.quantity': count }
    //                     }).then(() => {
    //                         resolve({ status: true })
    //                     })
    //         }
    //     })
    // },
    ChangeQuantity: async ({ cartId, productId, count, quantity }) => {
        count = parseInt(count)
        quantity = parseInt(quantity)
    
        // Get the product's current stock level
        const product = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .findOne({ _id: ObjectId(productId) })
        const currentStockLevel = product.product_quantity
        if (count === -1 && quantity === 1) {
          // Remove the product from the cart
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { _id: ObjectId(cartId) },
              { $pull: { products: { item: ObjectId(productId) } } }
            )
          return { removed: true }
        } else if (count > 0 && quantity >= currentStockLevel) {
          // Set the product's status to "out of stock" and notify the user
          await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .updateOne(
              { _id: ObjectId(productId) },
              { $set: { status: "out of stock" } }
            )
          return {
            status: false,
            message: "The requested quantity is not available.",
          }
        } else {
          // If the requested quantity is less than or equal to the stock level, update the quantity in the user's cart
          await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOneAndUpdate(
              { _id: ObjectId(cartId), "products.item": ObjectId(productId) },
              { $inc: { "products.$.quantity": count } }
            )
          return { status: true }
        }
      },

    getcartProducts: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { userId: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: {
                            cartId: '$_id',
                            productId: '$product._id'
                        },
                        product_title: { $first: '$product.name' },
                        product_price: { $first: '$product.price' },
                        product_image: { $first: '$product.image' },
                        quantity: { $sum: '$products.quantity' },
                        subtotal: { $sum: { $multiply: ['$products.quantity', '$product.price'] } }
                    }
                },
                {
                    $group: {
                        _id: '$_id.cartId',
                        products: {
                            $push: {
                                product_id: '$_id.productId',
                                product_title: '$product_title',
                                product_price: '$product_price',
                                quantity: '$quantity',
                                subtotal: '$subtotal',
                                image: '$product_image'
                            }
                        },
                        total: { $sum: '$subtotal' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        products: 1,
                        total: 1
                    }
                }
            ]).toArray()
            //    console.log(cartItems[0].products)
            resolve(cartItems[0])
        })
    },

    FindTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            const totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]
            ).toArray()
            console.log(totalAmount)
            resolve(totalAmount[0])
        })
    },
    findSubTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            const subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {
                        userId: ObjectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        _id: '$product._id',
                        name: '$product.product_title',
                        subtotal: {
                            $multiply: ['$products.quantity', '$product.price']
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        subtotal: {
                            $sum: '$subtotal'
                        }
                    }
                }
            ]).toArray()
            resolve(subtotal)
        })
    },
    removeCartProducts: (cartInfo) => {
        return new Promise((resolve, reject) => {
            const { cartId, productId } = cartInfo
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }).then(() => {
                    resolve({ removed: true })
                })
        })
    },
    addNewAddress: (address) => {
        try {
            const data = db.get().collection(collection.ADDRESS_COLLECTION).insertOne(address);
            return data
        } catch (error) {
            console.log(error);
            throw new Error("Failed To Fetch new addresses")
        }
    },
    getUserAdresses: async (userId) => {
        try {
            let addresses = await db.get().collection(collection.ADDRESS_COLLECTION).find({ userId: userId }).toArray()
            return addresses;
        } catch (error) {
            console.log(error);
            throw new Error("Failed To Fetch new addresses");
        }
    },
    getcurrentAddress: async (addressId) => {
        try {
            const address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: ObjectId(addressId) });
            return address;
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch current address");
        }
    },
    editAddress: async (addressId, addressInfo) => {
        try {
            const { name, phone, pincode, locality, address, city, state, landmark, alternatePhone } = addressInfo
            const response = await db.get().collection(collection.ADDRESS_COLLECTION).updateOne(
                { _id: ObjectId(addressId) },
                { $set: { name, phone, pincode, locality, address, city, state, landmark, alternatePhone } }
            )
            return response
        } catch (error) {
            console.log(error);
            throw new Error("Failed To edit new addresses");
        }
    },
    addressDelete: (addressId) => {
        try {
            db.get()
                .collection(collection.ADDRESS_COLLECTION)
                .deleteOne({ _id: ObjectId(addressId) });
            return;
        } catch (error) {
            console.log(error);
            throw new Error("Failed to delete address");
        }
    },
    placeOrder: async (order, products, total, address, o) => {
        try {
            console.log(order, products, total);

            let status = order.payment_method === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                address: address,
                userId: ObjectId(order.userId),
                paymentMethod: order.payment_method,
                products: products,
                totalAmount: total,
                status: status,
                date: new Date()
            }
            const response = await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
            await db.get().collection(collection.CART_COLLECTION).deleteOne({ userId: ObjectId(order.userId) })
            return Promise.resolve(response.insertedId)
        } catch (error) {
            return Promise.reject(error)
        }
    },
    getCartProductList: async (userId) => {
        try {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            return Promise.resolve(cart.products)
        } catch (error) {
            return Promise.reject(error)
        }
    },
    getUserOrders: async (userId) => {
        try {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray()
            console.log(orders);
            return Promise.resolve(orders)
        } catch (error) {
            return Promise.reject(error)
        }
    },
    getOrderProducts: async (orderId) => {
        try {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log(orderItems);
            return Promise.resolve(orderItems)
        } catch (error) {
            return Promise.reject(error)
        }
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            console.log(total);
            var options = {
                amount: parseInt(total.total),
                currency: 'INR',
                receipt: "" + orderId, // corrected spelling
                payment_capture: 1,
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                    reject(err); // reject the promise on error
                }
                console.log("New Order:", order);
                resolve(order);
            })
        })
    },
    verifyRazorpayPayments: (paymentInfo) => {
        const crypto = require('crypto');
        try {
            return new Promise((resolve, reject) => {
                let hmac = crypto.createHmac("sha256", "MqvVFvT9J9tsVMsEojRCOcZ0")
                hmac.update(
                    paymentInfo["order[razorpay_order_id]"] +
                    "|" +
                    paymentInfo["order[razorpay_payment_id]"]
                )
                hmac = hmac.digest("hex")
                if (hmac === paymentInfo["order[razorpay_signature]"]) {
                    resolve({ status: true })
                } else {
                    reject(new Error("Payment failed"))
                }
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to verify razorpay payments")
        }
    },
    changepaymentStatus: (orderId) => {
        try {
            console.log(orderId);
            return new Promise((resolve, reject) => {
                db.get()
                    .collection(collection.ORDER_COLLECTION)
                    .updateOne(
                        { _id: ObjectId(orderId) },
                        {
                            $set: {
                                status: "ordered",
                            }
                        }
                    )
                    .then((response) => {
                        console.log(response);
                        resolve()
                    })
            })
        } catch (error) {
            console.log(error)
            throw new Error("Failed while changing payment status")
        }

    },
    getOrdered: async (userId) => {
        try {
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectId(userId) }).toArray()
            console.log(orders);
            return orders
        } catch (errors) {
            console.log(errors);
        }
    },

    wishlistget: async (userId, productId) => {
        const product = {
            item: ObjectId(productId),
            quantity: 1
        }
        try {
            const wishlists = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ userId: ObjectId(userId) })
            if (wishlists) {
                const isProductExist = wishlists?.products.findIndex(product => {
                    return product.item === productId
                })
                if (isProductExist !== -1) {
                    await db.get().collection(collection.WISHLIST_COLLECTION)
                        .updateOne({ userId: ObjectId(userId), 'products.item': ObjectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            })
                } else {
                    const response = await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ userId: ObjectId(userId) }, {
                        $push: {
                            products: product
                        }
                    })
                    return response
                }
            } else {
                console.log('new cart created')
                const cart = {
                    userId: ObjectId(userId),
                    products: [product]
                }
                await db.get().collection(collection.WISHLIST_COLLECTION).insertOne(cart)
                console.log('added product into the cart')
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },
    getwishlistProducts: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            const wishlisted = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { userId: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: {
                            wishlistId: '$_id',
                            productId: '$product._id'
                        },
                        product_title: { $first: '$product.name' },
                        product_price: { $first: '$product.price' },
                        product_image: { $first: '$product.image' },
                        quantity: { $sum: '$products.quantity' },
                        subtotal: { $sum: { $multiply: ['$products.quantity', '$product.price'] } }
                    }
                },
                {
                    $group: {
                        _id: '$_id.wishlistId',
                        products: {
                            $push: {
                                product_id: '$_id.productId',
                                product_title: '$product_title',
                                product_price: '$product_price',
                                quantity: '$quantity',
                                subtotal: '$subtotal',
                                image: '$product_image'
                            }
                        },
                        total: { $sum: '$subtotal' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        products: 1,
                        total: 1
                    }
                }
            ]).toArray()
             console.log("########",wishlisted)
            resolve(wishlisted)
        })
    },


}
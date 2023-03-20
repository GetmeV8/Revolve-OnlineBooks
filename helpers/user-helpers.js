var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
let twilio = require('../middlewares/twilio')
const { ObjectId } = require('mongodb');
const { CART_COLLECTION } = require('../config/collections');
const { response } = require('express');

module.exports = {
    doSignup: (userdata) => {

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.email })
            // console.log(user)
            // let regUser = {}
            if (user) {
                console.log("email already exsist")
                // regUser.status = true;
                resolve(false)
            }
            else {
                userdata.access = true
                console.log(userdata.password)
                userdata.password = await bcrypt.hash(userdata.password, 10)
                // .then((hash)=>{
                //     console.log(hash)
                // }).catch((err)=>{
                //     console.log(err);
                // })
                await db.get().collection(collection.USER_COLLECTION).insertOne(userdata)
                console.log("document inserted successfully")

                resolve(true)
            }
        })

    },
    doLogin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            console.log(userdata)
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.name })
            console.log(user)
            if (!user.access) {
                resolve({ blocked: true })
            }
            else if (user) {
                bcrypt.compare(userdata.password, user.password).then((status) => {
                    if (status) {
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    }
                    else {
                        resolve({ status: false })
                    }
                })
            }
            else {
                resolve({ status: false })
            }
        })
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
    // addcartget: (productId, userId) => {
    //     const product = {
    //         item: ObjectId(productId),
    //         quantity: 1
    //     }
    //     return new Promise(async (resolve, reject) => {
    //         const UserCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId)})
    //           console.log(UserCart)
    //         //   console.log(ObjectId(productId))
    //         if (UserCart) {
    //             console.log('The cart exists');
    //             const IsproductExist = UserCart?.products.findIndex(product => {
    //                 return product.item == productId
    //             })
    //             console.log(IsproductExist);
    //             if (IsproductExist !== -1) {
    //                 console.log('This product already exist')
    //                 db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId), 'products.item': ObjectId(productId) },
    //                     {
    //                         $inc: { 'products.$.quantity': 1 }
    //                     }).then(() => {
    //                         resolve()
    //                     })
    //             } else {
    //                 db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId) },
    //                     {
    //                         $push: {
    //                             products: product
    //                         }
    //                     }).then((response) => {
    //                         console.log("Updated Cart");
    //                         resolve(response)
    //                     })
    //             }
    //         } else {
    //             console.log("New Cart Created");
    //             const cart = {
    //                 userId: ObjectId(userId),
    //                 products: [product]
    //             }
    //             db.get().collection(collection.CART_COLLECTION).insertOne(cart).then((response) => {
    //                 console.log("Added Product to the cart.");
    //                 resolve(response)
    //             })
    //         }
    //     })
    // },
    addcartget: async (userId,productId) => {
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

    ChangeQuantity: (productdata) => {
        return new Promise((resolve, reject) => {
            let { cartId, productId, count, quantity } = productdata
            count = parseInt(count)
            quantity = parseInt(quantity)
            if (count === -1 && quantity === 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                    {
                        $pull: { products: { item: ObjectId(productId) } }
                    }).then(() => {
                        resolve({ removed: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION).
                    findOneAndUpdate({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then(() => {
                            resolve({ status: true })
                        })
            }
        })
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
                                product_title: '$name',
                                product_price: '$product.price',
                                quantity: '$quantity',
                                subtotal: '$subtotal'
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
            console.log(cartItems[0].product)
            resolve(cartItems[0])
        })
    },

    findTotalAmout: (userId) => {
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
                        total: { $sum: { $multiply: ['$quantity', '$product.product_price'] } }
                    }
                }
            ]
            ).toArray()
            console.log(totalAmount)
            resolve(totalAmount[0])
        })
    }



}
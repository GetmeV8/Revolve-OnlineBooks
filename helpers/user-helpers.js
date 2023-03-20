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
    cartget: (productId, userId) => {
        const product = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            const UserCart = await db.get().collection(collection.CART_COLLECTION).findOne({ userId: ObjectId(userId) })
            console.log(UserCart)
            console.log(ObjectId(productId))
            if (UserCart) {
                console.log('The cart exists');
                const IsproductExist = UserCart?.products.findIndex(product => {
                    return product.item == productId
                })
                console.log(IsproductExist);
                if (IsproductExist !== -1) {
                    console.log('This product already exist')
                    db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId), 'products.item': ObjectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ userId: ObjectId(userId) },
                        {
                            $push: {
                                products: product
                            }
                        }).then((response) => {
                            console.log("Updated Cart");
                            resolve(response)
                        })
                }
            } else {
                console.log("New Cart Created");
                const cart = {
                    userId: ObjectId(userId),
                    products: [product]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cart).then((response) => {
                    console.log("Added Product to the cart.");
                    resolve(response)
                })
            }
        })
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



}
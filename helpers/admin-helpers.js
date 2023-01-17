var db = require('../config/connection')
var collection = require('../config/collections')
const { ADMIN_COLLECTION } = require('../config/collections')
const { PRODUCT_COLLECTION } = require('../config/collections');
const { CATEGORY_COLLECTION } = require('../config/collections');
const { ObjectID, ObjectId } = require('bson');
let objectId = require('mongodb').ObjectId;
module.exports = {
    allUsers: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            if (admin) {
                resolve(admin);
                console.log(admin)
            }
            else {
                resolve({ satus: false })
            }
        })
    },
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {

            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ name: adminData.name })
            if (admin.password == adminData.password) {
                response.admin = admin;
                response.status = true;
                resolve(admin)
            }
            else {
                resolve({ status: false })
            }
        })
    },
    blockUsers: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { access: false } }).then(() => {
                resolve({ status: true });
            })
        })
    },
    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { access: true } }).then(() => {
                resolve({ status: true });
            })
        })
    },
    addProduct: (product) => {
        return new Promise((resolve, reject) => {
            product.isActive = true;
            let data =db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
            resolve(data)
        })
    },
    viewProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        })

    },
    editProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let document = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: ObjectId(id) }).toArray()
            resolve(document)

        })
    },
    updateProduct: (id, obj) => {
        return new Promise((resolve, reject) => {
            console.log(id);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: obj }).then((data) => {
                console.log(data)
                resolve(data)
            })
            console.log(obj)

        })
    },
    getallCategories: () => {
        return new Promise(async(resolve, reject) => {
            let categories =await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
            resolve(categories)
        })
    },
    addCategories: (category) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((response) => {
                resolve(response);
            })
        })
    }, 
    allCategory: () => {
        return new Promise((resolve, reject) => {
            let category = db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    }


}


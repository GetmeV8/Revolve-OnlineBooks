var db = require('../config/connection')
var collection = require('../config/collections')
const { PRODUCT_COLLECTION } = require('../config/collections')
let objectId = require('mongodb').ObjectId;

module.exports = {
    pageProductLoading: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products)
        })
    },
    productView : (productId) =>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
            resolve(products)
        })
    },


    



}
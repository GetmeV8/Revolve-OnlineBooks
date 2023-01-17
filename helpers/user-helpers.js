var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
let twilio = require('../middlewares/twilio')
const { ObjectId } = require('mongodb');

module.exports = {
    doSignup: (userdata) => {

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userdata.email })
            // console.log(user)
            let regUser = {}
            if (user) {
                console.log("worked")
                regUser.status = true;
                resolve(regUser)
            }
            else {
                userdata.access=true
                console.log(userdata.password)
                userdata.password = await bcrypt.hash(userdata.password, 10)
                // .then((hash)=>{
                //     console.log(hash)
                // }).catch((err)=>{
                //     console.log(err);
                // })
                db.get().collection(collection.USER_COLLECTION).insertOne(userdata)
                console.log("worked")

                resolve({ status: false, userdata })
            }
        })

    },
    doLogin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            console.log(userdata)
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email : userdata.name })
            console.log(user)
            if(!user.access){
                resolve({blocked:true})
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
    }


}
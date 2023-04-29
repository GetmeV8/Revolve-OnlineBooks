// const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
// const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
// const serviceSid = process.env.TWILIO_SERVICE_SID; // My Service SID from www.twilio.com/console
require('dotenv').config()
const accountSid =process.env.TWILIO_ACCOUNT_SID
const authToken =process.env.TWILIO_AUTH_TOKEN
const serviceSid =process.env.TWILIO_SERVICE_SID


const client = require('twilio')(accountSid, authToken);



// api for sending otp to the user mobile number....
//    const  generateOpt= (mobileNo) => {
//         return new Promise((resolve, reject) =>{
//             console.log(mobileNo)
//             client.verify
//             .services(serviceSid)
//             .verifications
//             .create({
//                 to : `+91${mobileNo}`,
//                 channel :'sms'
//             })
//             .then((verifications) => {
//                resolve(verifications.sid)  
//             });
//         })
//     }
    const generateOpt = (mobileNo) => {
        return new Promise((resolve, reject) => {
          console.log(mobileNo);
          client.verify
            .v2.services(serviceSid)
            .verifications
            .create({
              to: `+91${mobileNo}`,
              channel: 'sms'
            })
            .then((verification) => {
              resolve(verification.sid);
            })
            .catch((error) => {
              reject(error);
            });
        });
      };
      
// api for verifying the otp recived by the user 
    // const verifyOtp =(mobileNo,otp) =>{
    //     console.log("mobile and otp")
    //     console.log(mobileNo,otp)
    //     return new Promise((resolve, reject) =>{
    //         client.verify
    //         .services(serviceSid)
    //         .verificationChecks
    //         .create({
    //             to : `+91${mobileNo}`,
    //             code : otp
    //         })
    //         .then((verifications) => {
    //            resolve(verifications)
    //         })
    //     })
    // }
    const verifyOtp = (mobileNo, otp) => {
        console.log("mobile and otp");
        console.log(mobileNo, otp);
        return new Promise((resolve, reject) => {
          client.verify
            .v2.services(serviceSid)
            .verificationChecks
            .create({
              to: `+91${mobileNo}`,
              code: otp
            })
            .then((verificationCheck) => {
              resolve(verificationCheck);
            })
            .catch((error) => {
              reject(error);
            });
        });
      };
      
module.exports={generateOpt,verifyOtp}
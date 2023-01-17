// const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
// const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
// const serviceSid = process.env.TWILIO_SERVICE_SID; // My Service SID from www.twilio.com/console

const accountSid ='ACd2a0d27270298bc317ae8cf776f5e1fd'
const authToken ='cdab3fc41de610548d056f09fb6e3239' 
const serviceSid ='VA88b406bbba327add825f04ebe6123a0f';


const client = require('twilio')(accountSid, authToken);



// api for sending otp to the user mobile number....
   const  generateOpt= (mobileNo) => {
        return new Promise((resolve, reject) =>{
            console.log(mobileNo)
            client.verify
            .services(serviceSid)
            .verifications
            .create({
                to : `+91${mobileNo}`,
                channel :'sms'
            })
            .then((verifications) => {
               resolve(verifications.sid)  
            });
        })
    }
// api for verifying the otp recived by the user 
    const verifyOtp =(mobileNo,otp) =>{
        console.log("mobile and otp")
        console.log(mobileNo,otp)
        return new Promise((resolve, reject) =>{
            client.verify
            .services(serviceSid)
            .verificationChecks
            .create({
                to : `+91${mobileNo}`,
                code : otp
            })
            .then((verifications) => {
               resolve(verifications)
            })
        })
    }
module.exports={generateOpt,verifyOtp}
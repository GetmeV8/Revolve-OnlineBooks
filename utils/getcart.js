const {  getCartTotalAmount } = require('../helpers/user-helpers');

async function getTotalPrice(req) {
    let user=req.session.user
    
    return getCartTotalAmount(user._id).then((total) => total).catch(() => {
      console.log('get total amount error');
      const total = null;
      return total;
    });
  }
module.exports = {  getTotalPrice };

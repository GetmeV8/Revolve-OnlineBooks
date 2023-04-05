const adminHelpers = require('../helpers/admin-helpers');
let productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


module.exports = {
    productListing: async(req, res) => {
        let user = req.session.user;
        let category = await adminHelpers.getallCategories()
        console.log("|||||",category);
        productHelper.pageProductLoading().then((products) => {
            console.log(products)
            res.render('user/user-shop', { user, products , category})
        })
    },
    productView: (req, res) => {
        let productId = req.params.id;
        let user = req.session.user;
        productHelper.productView(productId).then((products) => {
           console.log(products)
            res.render('user/product-view', { products, user });
        })
    },

}
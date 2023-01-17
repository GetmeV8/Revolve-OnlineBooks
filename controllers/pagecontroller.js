let productHelper = require('../helpers/product-helpers')


module.exports = {
    productListing: (req, res) => {
        let user = req.session.user;
        productHelper.pageProductLoading().then((products) => {
            console.log(products)
            res.render('user/user-shop', { user, products })
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
let { check} = require('express-validator');
module.exports = {
    adminLoginValidate: [
      check('email')
        .notEmpty()
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('The email is not valid')
        .trim()
    ],







    // addProductValidate: [
    //   check('product_title')
    //     .notEmpty()
    //     .withMessage('Product name cannot be empty')
    //     // .matches(/^[A-Za-z0-9]/)
    //     // .withMessage('Invalid product name')
    //     .trim(),
    //   check('product_brand')
    //     .notEmpty()
    //     // .withMessage('Product brand cannot be empty')
    //     // .matches(/^[A-Za-z0-9]/)
    //     .withMessage('Invalid brand name')
    //     .trim(),
    //   check('product_price')
    //     .notEmpty()
    //     .withMessage('Product price cannot be empty')
    //     .isNumeric()
    //     .withMessage('Product price must be a number')
    //     .isFloat({ min: 0 })
    //     .withMessage('Quantity must be a positive number')
    //     .trim(),
    //   check('product_description')
    //     .notEmpty()
    //     .withMessage('Product description cannot be empty')
    //     // .matches(/^[A-Za-z0-9]/)
    //     // .withMessage('Invalid description for the product')
    //     .trim(),
    //   check('product_color')
    //     .notEmpty()
    //     .withMessage('Product color cannot be empty')
    //     // .matches(/^[A-Za-z0-9]/)
    //     // .withMessage('Please enter a valida color')
    //     .trim(),
    //     check('delivery')
    //     .notEmpty()
    //     .withMessage("Product delivery cannot be empty")
    //     .trim(),
    //     check('product_quantity')
    //     .notEmpty()
    //     .withMessage('Quantity  cannot be empty')
    //     .isNumeric()
    //     .withMessage('Quantity must be a number')
    //     .isFloat({ min: 0 })
    //     .withMessage('Quantity must be a positive number')
    //     .trim(),
        
  
    // ]
  
}


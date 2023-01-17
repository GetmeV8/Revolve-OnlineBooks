let { check, validationResult } = require('express-validator');
module.exports={
    adminLoginValidate:[
        check('email')
          .notEmpty()
          .withMessage("Email cannot be empty")
          .isEmail()
          .withMessage("The email is not valid")
          .trim(),
      ],
      addProductValidate:[
        check('product_title')
          .notEmpty()
          .withMessage("Product name cannot be empty")
          .matches(/^[A-Za-z0-9]/)
          .withMessage("Invalid product name")
          .trim(),
          check('product_brand')
          .notEmpty()
          .withMessage("Product brand cannot be empty")
          .matches(/^[A-Za-z0-9]/)
          .withMessage("Invalid brand name")
          .trim(),
          check('product_price')
          .notEmpty()
          .withMessage("Product price cannot be empty")
          .isNumeric()
          .withMessage("Product price must be a number")
          .trim(),
          check('product_description')
          .notEmpty()
          .withMessage("Product description cannot be empty")
          .matches(/^[A-Za-z0-9]/)
          .withMessage("Invalid description for the product")
          .trim(),
          check('product_color')
          .notEmpty()
          .withMessage("Product color cannot be empty")
          .matches(/^[A-Za-z0-9]/)
          .withMessage("Please enter a valida color")
          .trim(),
          //  check('product_image')
          // .notEmpty()
          // .withMessage("Product image cannot be empty")
          // .trim(),
          // check('category')
          // .notEmpty()
          // .withMessage("Product category cannot be empty")
          // .trim(),
          // check('seller')
          // .notEmpty()
          // .withMessage("Product seller cannot be empty")
          // .trim(),
          // check('delivery')
          // .notEmpty()
          // .withMessage("Product delivery cannot be empty")
          // .trim(),
          // check('quantity')
          // .notEmpty()
          // .withMessage("Product quantity cannot be empty")
          // .trim(),
          // check('material')
          // .notEmpty()
          // .withMessage("Product material cannot be empty")
          // .trim(),
          // check('care')
          // .notEmpty()
          // .withMessage("Product rating cannot be empty")
          // .trim(),
          // check('fit')
          // .notEmpty()
          // .withMessage("Product rating cannot be empty")
          // .trim(),
          // check('neck')
          // .notEmpty()
          // .withMessage("Product rating cannot be empty")
          // .trim(),
      
      ]

}
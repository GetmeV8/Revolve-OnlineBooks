let { check, validationResult } = require('express-validator');
module.exports = {
  userSignUpValidate: [
    check('name')
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ min: 2 })
      .withMessage("Name should have atleast two letters")
      .trim(),
    check('phone')
      .notEmpty()
      .withMessage("Phone number cannot be empty")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number should have 10 numbers")
      .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
      .withMessage("Phone number is not valid"),
    check('email')
      .notEmpty()
      .isEmail()
      .withMessage("Please enter your valid email address")
      .trim(),
    check('password')
      .notEmpty()
      .isLength({ min: 8, max: 15 })
      .withMessage("your password should have min and max length between 8-15")
      .matches(/\d/)
      .withMessage("your password should have at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("your password should have at least one sepcial character")
      .trim(),
  ],
  userLoginValidate: [
    check('phone')
      .notEmpty()
      .withMessage("Phone number cannot be empty")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number should have 10 numbers")
      .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
      .withMessage("Phone number is not valid"),
      check('password')
      .notEmpty()
      .withMessage("Password is not valid")
      .trim(),
  ],

}
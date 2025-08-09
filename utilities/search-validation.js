const { body } = require("express-validator");

const searchValidation = [
  body("make")
    .trim()
    .notEmpty()
    .withMessage("Make is required."),

  body("minPrice")
    .optional()
    .isNumeric()
    .withMessage("Minimum price must be a number."),

  body("maxPrice")
    .optional()
    .isNumeric()
    .withMessage("Maximum price must be a number."),
];

module.exports = searchValidation;
    
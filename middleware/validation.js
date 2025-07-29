const { body, validationResult } = require("express-validator");

// Shared Error Handler
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("message", errors.array()[0].msg);
    return res.redirect("back");
  }
  next();
}

// Classification Validation
const validateClassification = [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .isAlphanumeric().withMessage("Only letters and numbers allowed.")
    .custom(value => {
      if (/\s|\W/.test(value)) {
        throw new Error("No spaces or special characters allowed.");
      }
      return true;
    }),
  handleValidationErrors
];

// Inventory Validation
const validateInventory = [
  body("inv_make").trim().notEmpty().isAlpha().withMessage("Make must contain only letters."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").notEmpty().withMessage("Year is required.")
    .isInt({ min: 1900, max: 2099 }).withMessage("Year must be between 1900 and 2099."),
  body("inv_miles").notEmpty().withMessage("Miles is required.")
    .isInt({ min: 0 }).withMessage("Miles must be a positive number."),
  body("inv_price").notEmpty().withMessage("Price is required.")
    .matches(/^\d+(\.\d{1,2})?$/).withMessage("Price must be a valid number."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("classification_id").notEmpty().withMessage("Please choose a classification."),
  handleValidationErrors
];

module.exports = {
  validateClassification,
  validateInventory
};

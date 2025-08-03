// inventory-validation.js
const { body, validationResult } = require("express-validator")
const utilities = require(".") // adjust path if needed

// 🔧 Rules for validating inventory update
const newInventoryRules = () => {
  return [
    body("inv_make").trim().isLength({ min: 1 }).withMessage("Please enter a valid make."),
    body("inv_model").trim().isLength({ min: 1 }).withMessage("Please enter a valid model."),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Enter a valid year."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Enter a valid price."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be a positive number."),
    body("inv_color").trim().isLength({ min: 1 }).withMessage("Enter a color."),
    body("classification_id").isInt().withMessage("Choose a classification."),
    // Add more rules if needed for image, description, etc.
  ]
}

// 🔧 Function to handle validation errors on update
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`

    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    })
  }
  next()
}

module.exports = {
  newInventoryRules,
  checkUpdateData,
}

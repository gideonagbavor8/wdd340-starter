// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Detail view route with error handling
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

// Combined routes for adding classification
// router.get("/add-classification", invController.showAddClassificationForm);
// router.post(
//   "/add-classification",
//   validation.validateClassification,
//   invController.addClassification
// );

// For inventory POST
// router.post(
//   "/add-inventory",
//   validation.validateInventory,
//   invController.addInventory
// );


router.get("/", utilities.handleErrors(invController.buildManagement))


module.exports = router;

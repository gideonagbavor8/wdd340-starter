// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validation = require("../middleware/validation");



// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Detail view route with error handling
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));
router.get("/add-classification", invController.buildAddClassification);

router.get("/", utilities.handleErrors(invController.buildManagementView))
router.post("/add-classification",
  validation.validateClassification,
  invController.addClassification
);

router.get("/add-inventory", invController.buildAddInventory);
router.post("/add-inventory",
  validation.validateInventory, // your server-side middleware
  invController.addInventory
);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


// Show delete confirmation view
router.get("/delete/:inv_id", invController.buildDeleteView)

// Handle actual delete
router.post("/delete", invController.deleteInventoryItem)

// Build view for editing inventory item
router.get("/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView))


module.exports = router;

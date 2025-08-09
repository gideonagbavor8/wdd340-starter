// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const validation = require("../middleware/validation");
const inventoryValidate = require("../utilities/inventory-validation")
const { check, validationResult } = require("express-validator");
// console.log(invController)
const searchValidation = require("../utilities/search-validation");





router.get("/", utilities.checkAccountType, invController.buildManagementView)

router.get("/add-classification", utilities.checkAccountType, invController.buildAddClassification)
router.post("/add-classification", utilities.checkAccountType, invController.addClassification)
router.get("/add-inventory", utilities.checkAccountType, invController.buildAddInventory)
router.post("/add-inventory", utilities.checkAccountType, invController.addInventory)
router.get("/edit/:invId", utilities.checkAccountType, invController.editInventoryView)
router.post("/edit/", utilities.checkAccountType, invController.updateInventory)
router.post("/delete/:invId", utilities.checkAccountType, invController.deleteInventoryItem)


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


// Route to update inventory
router.post("/update",
  inventoryValidate.newInventoryRules(),
  inventoryValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)


// Show delete confirmation view
router.get("/delete/:inv_id", invController.buildDeleteView)

// Handle actual delete
router.post("/delete", invController.deleteInventoryItem)

// Build view for editing inventory item
router.get("/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView))

router.get("/search", utilities.handleErrors(invController.buildSearchView));
router.post("/search", searchValidation,
utilities.handleErrors(invController.searchInventory)
);


// router.get("/search/reset", invController.resetSearch);




module.exports = router;

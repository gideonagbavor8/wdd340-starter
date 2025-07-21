// Needed REsources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const { route } = require("./static")
const utilities = require("../utilities/") 

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView))

module.exports = router;
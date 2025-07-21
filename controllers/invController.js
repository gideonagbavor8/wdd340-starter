const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

// Build vehicle detail view
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.inv_id
  try {
    const vehicleData = await invModel.getVehicleById(inv_id)
    if (!vehicleData) {
      return res.status(404).render("error", { message: "Vehicle not found" })
    }
    const detailHTML = await utilities.buildVehicleDetail(vehicleData)
    let nav = await utilities.getNav() // <-- Add this line
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav, // <-- Pass nav to the view
      detailHTML,
      vehicle: vehicleData
    })
  } catch (error) {
    next(error)
  }
}


module.exports = invCont
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
    let nav = await utilities.getNav()
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailHTML,
      vehicle: vehicleData
    })
  } catch (error) {
    next(error)
  }
}

// Inventory management view
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice")
  })
}


invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    message: req.flash("message"),
    nav,
  });
};

invCont.addClassification = async function(req, res) {
  const { classification_name } = req.body;

  try {
    const result = await invModel.insertClassification(classification_name);

    if (result.rowCount > 0) {
      req.flash("message", "Classification added successfully!");
      // You may also rebuild the nav here if needed
      res.redirect("/inv/");
    } else {
      req.flash("message", "Insertion failed. Please try again.");
      res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("Insert Error:", error);
    req.flash("message", "Server error. Try again.");
    res.redirect("/inv/add-classification");
  }
};

invCont.buildAddInventory = async function(req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationSelect,
    message: req.flash("message"),
  });
};

invCont.addInventory = async function(req, res) {
  const { inv_make, inv_model, inv_year, inv_miles, inv_price, inv_description,
    inv_color, inv_image, inv_thumbnail, classification_id } = req.body;

  try {
    const result = await invModel.insertInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_miles,
      inv_price,
      inv_description,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id
    });

    if (result.rowCount > 0) {
      req.flash("message", "Vehicle added successfully!");
      res.redirect("/inv/");
    } else {
      req.flash("message", "Failed to add vehicle.");
      const nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationSelect,
        message: req.flash("message"),
        ...req.body // sticky values
      });
    }
  } catch (error) {
    console.error("Insert Error:", error);
    req.flash("message", "Server error.");
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      message: req.flash("message"),
      ...req.body
    });
  }
};




// ✅ Export the controller object
module.exports = invCont

const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
// const Util = require("../utilities")
const { validationResult } = require("express-validator");



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
    const vehicleData = await invModel.getInventoryById(inv_id)
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
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    errors: null,
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
    errors: [],
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

/* ===============================
 * Deliver Delete Confirmation View
 * =============================== */
invCont.buildDeleteView = async function(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ===============================
 * Process Delete Inventory Item
 * =============================== */
invCont.deleteInventoryItem = async function(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}


/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  // const classificationSelect = await buildClassificationList(itemData.classification_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)


  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Update " + itemName,
    nav,
    // classificationSelect,
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}



/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    inv_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("message", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("message", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      inv_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    })
  }
}

invCont.searchInventory = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("inventory/search", {
      title: "Inventory Search",
      nav,
      classificationSelect,
      errors: errors.array(),
      filters: req.body,
      results: null,
      message: null,
      filterSummary: null // ✅ Add this to avoid undefined error
    });
  }

  try {
    const filters = req.body;
    const results = await invModel.searchInventory(filters);

    const summaryParts = [];
    if (filters.make) summaryParts.push(`Make: ${filters.make}`);
    if (filters.model) summaryParts.push(`Model: ${filters.model}`);
    if (filters.color) summaryParts.push(`Color: ${filters.color}`);
    if (filters.year) summaryParts.push(`Year: ${filters.year}`);
    if (filters.price) summaryParts.push(`Price ≥ ${filters.price}`);

    const filterSummary = summaryParts.join(", ");

    // Store filters and results in session
    req.session.searchFilters = filters;
    req.session.searchResults = results.rows;

    if (results.rows.length === 0) {
      return res.render("inventory/search", {
        title: "Inventory Search",
        nav,
        classificationSelect,
        errors: [],
        filters,
        results: null,
        message: "No results found for your search.",
        filterSummary // ✅ Included here
      });
    }

    res.render("inventory/search", {
      title: "Inventory Search",
      nav,
      classificationSelect,
      errors: [],
      filters,
      results: results.rows,
      message: null,
      filterSummary // ✅ Included here
    });
  } catch (error) {
    console.error("Search error:", error);

    res.render("inventory/search", {
      title: "Inventory Search",
      nav,
      classificationSelect,
      errors: [{ msg: "Something went wrong. Please try again." }],
      filters: req.body,
      results: null,
      message: null,
      filterSummary: null
    });
  }
};


invCont.buildSearchView = async function (req, res) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  const filters = req.session.searchFilters || {};
  const results = req.session.searchResults || null;

  // Build summary if filters exist
  const summaryParts = [];
  if (filters.make) summaryParts.push(`Make: ${filters.make}`);
  if (filters.model) summaryParts.push(`Model: ${filters.model}`);
  if (filters.color) summaryParts.push(`Color: ${filters.color}`);
  if (filters.year) summaryParts.push(`Year: ${filters.year}`);
  if (filters.price) summaryParts.push(`Price ≥ ${filters.price}`);
  const filterSummary = summaryParts.length ? summaryParts.join(", ") : null;

  res.render("inventory/search", {
    title: "Inventory Search",
    nav,
    classificationSelect,
    errors: [],
    filters,
    results,
    message: null,
    filterSummary // ✅ This line prevents the EJS error
  });

  // Optionally clear session after rendering
  req.session.searchFilters = null;
  req.session.searchResults = null;
};










module.exports = invCont

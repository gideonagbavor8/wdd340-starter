const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken");
// reequire("dotenv").config();

// Constructs the nav HTML unordered list
Util.getNav = async function () {
    let data = await invModel.getClassifications()
    console.log(data)
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

// Build the classification view HTML
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            console.log(vehicle.inv_thumbnail)
            grid += '<li>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.buildVehicleDetail = async function (vehicle) {
  if (!vehicle) return "<p class='notice'>Vehicle not found.</p>"
  // Use full-size image, not thumbnail
  let imgPath = vehicle.inv_image.replace(/^vehicles\/vehicles\//, 'vehicles/')
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-img-wrapper">
        <img src="${imgPath}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-detail-img" />
      </div>
      <div class="vehicle-detail-info">
        <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p class="vehicle-price"><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
        <p class="vehicle-mileage"><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </div>
  `
}

//  Middleware For Handling Errors
//  Wrap other functions in this for
//  General Error Handling
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

Util.buildClassificationList = async function(classification_id = null) {
  const data = await invModel.getClassifications();
  let list = '<select name="classification_id" id="classificationList" required>';
  list += "<option value='' disabled selected>-- Select a Classification--</option>";
  data.rows.forEach(row => {
    list += `<option value="${row.classification_id}"`;
    if (classification_id && row.classification_id == classification_id) {
      list += " selected";
    }
    list += `>${row.classification_name}</option>`;
  });
  list += "</select>";
  return list;
};


//  Middleware to make accountData available in views
Util.injectAccountData = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET);
      res.locals.accountData = decoded; // Assuming decoded contains account data
      // console.log("Middleware injected accountData:", res.locals.accountData);
    } catch (error) {
      console.error("JWT verification error:", error.message);
      res.locals.accountData = null;
    }
  } else {
    res.locals.accountData = null;
  }
  next();
}

Util.checkAccountType = (req, res, next) => {
  const accountData = req.session.accountData

  if (accountData && (accountData.account_type === 'Employee' || accountData.account_type === 'Admin')) {
    return next()
  }

  req.flash("notice", "Access restricted: Employee or Admin only.")
  return res.redirect("/account/login")
}





module.exports = Util

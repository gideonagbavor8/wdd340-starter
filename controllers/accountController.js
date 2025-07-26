const utilities = require("../utilities")
const messages = require("express-messages")
const accountModel = require("../models/account-model")


/* ****************************************
 * Account Controller
 * ****************************************/

/* ======= Deliver Login View ======= */
async function buildLogin(req, res, next) {
  try {
    req.flash("notice", "This is a flash message.")
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      messages: messages(req, res)
    })
  } catch (error) {
    next(error)
  }
}

// Deliver registration view
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

// Process Registration
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, registerAccount }

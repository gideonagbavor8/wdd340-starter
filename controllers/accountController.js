const utilities = require("../utilities")
const messages = require("express-messages")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcrypt");


/* ****************************************
 * Account Controller
 * ****************************************/

/* ======= Deliver Login View ======= */
async function buildLogin(req, res, next) {
  try {
    // req.flash("notice", "This is a flash message.")
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


//  Process login request

async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  console.log("Attempting login with email:", account_email); // Debug log
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    console.log("Account not found for email:", account_email); // Debug log
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    console.log("Comparing password for:", account_email); // Debug log
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      console.log("Password match successful for:", account_email); // Debug log
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        console.log
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      req.flash("notice", "You are now logged in.");
      return res.redirect("/account/");
    } else {
      console.log("Password mismatch for:", account_email); // Debug log
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("error", "An error occurred. Please try again.");
    res.status(500).render("account/login", { title: "Login", nav, errors: null });
  }
}

async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./account/management", {
      title: "Account Management",
      nav,
      message: req.flash("notice"), 
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }

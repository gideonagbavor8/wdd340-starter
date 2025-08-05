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
      message: req.flash("notice"), 
      errors: null,
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
  const accountData = await accountModel.getAccountByEmail(account_email);
  console.log("Attempting login with email:", account_email); // Debug log

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
  console.log("Login account_type:", accountData.account_type); // Check exact value

  try {
    console.log("Comparing password for:", account_email); // Debug log
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      console.log("Password match successful for:", account_email); // Debug log
      delete accountData.account_password;
      req.session.accountData = {
        account_id: accountData.account_id,
        account_type: accountData.account_type,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email
      };
      console.log("Session accountData:", req.session.accountData);
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
    const nav = await utilities.getNav();
    const message = req.flash("notice") || null; // Safely retrieve flash message
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: [],
      message
    });
  } catch (error) {
    next(error);
  }
}


function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/") // Or redirect to /account/login if preferred
}

async function buildUpdateAccount(req, res, next) {
  try {
    const accountId = parseInt(req.params.accountId);
    const accountData = await accountModel.getAccountById(accountId);

    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/login");
    }

    const nav = await utilities.getNav(); 
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: [],
      message: null,
      account_id: accountData.account_id,
      account: accountData             
    });
  } catch (error) {
    console.error("Error delivering update account view:", error);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/account/"); 
  }
}


// 1. Build update view
async function buildEditAccountView(req, res) {
  const accountId = parseInt(req.params.accountId);
  const accountData = await accountModel.getAccountById(accountId);
  res.render("account/update-account", {
    title: "Update Account",
    account_id: accountId,
    account,
    errors: [],
    message: null,
  });
}

// 2. Update account info
async function updateAccount(req, res) {
  try {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const result = await accountModel.updateAccountInfo({
      account_firstname,
      account_lastname,
      account_email,
      account_id
    });

    const updatedAccount = await accountModel.getAccountById(account_id);
    const message = result ? "Account updated successfully." : "Update failed.";
    const nav = await utilities.getNav();
    const errors = [];
    const title = "Account Management";

    res.render("account/management", {
      title,
      nav,
      account: updatedAccount,
      errors,
      message
    });
  } catch (err) {
    console.error("Account update error:", err.message);
    req.flash("notice", "Server error during account update.");
    res.redirect("/account/");
  }
}


// 3. Change password
async function changePassword(req, res) {
  const { password, account_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await accountModel.updatePassword(account_id, hashedPassword);
  let message = result ? "Password updated successfully." : "Password update failed.";
  const updatedAccount = await accountModel.getAccountById(account_id);
  res.render("account/management", { account: updatedAccount, message });
}




module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, logoutAccount, buildUpdateAccount, buildEditAccountView, updateAccount, changePassword }

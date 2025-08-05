const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}


// Registration Data Validation Rules

validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}


// Check data and return errors or continue to registration
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


// Login Data Validation Rules
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

// Check login data and return errors or continue to login
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};


// Update Account
validate.updateAccountRules = () => {
  return [
    body("firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),

    body("lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),

    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
  ];
};

// Change Password
validate.changePasswordRules = () => {
  return [
    body("password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character.")
  ];
};


// Check Update Account Data
validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  const accountData = req.body;
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      errors: errors.array(),
      accountData
    });
  }
  next();
};

// Check Password Change Data
validate.checkPasswordChange = async (req, res, next) => {
  const errors = validationResult(req);
  const accountData = req.body;
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      errors: errors.array(),
      accountData
    });
  }
  next();
};




module.exports = validate
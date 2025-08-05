const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// GET routes
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/", utilities.handleErrors(accountController.buildAccountManagement))
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))
router.get("/update/:accountId", accountController.buildUpdateAccount);
router.get("/edit/:accountId", accountController.buildEditAccountView);





// POST routes
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post("/update",
  // regValidate.updateAccountRules(),
  // regValidate.checkUpdateAccountData(),
  utilities.handleErrors(accountController.updateAccount)
);

router.post("/change-password",
  // regValidate.changePasswordRules(),
  // regValidate.checkPasswordData(),
  utilities.handleErrors(accountController.changePassword)
);

module.exports = router

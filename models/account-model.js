const pool = require("../database/");
const bcrypt = require("bcrypt"); // Add this at the top

// Register new account
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10); // Hash password with salt rounds 10
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, hashedPassword]);
  } catch (error) {
    console.error("Registration error:", error.message); // Log the error for debugging
    throw new Error("Registration failed"); // Throw error for better handling
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Email lookup error:", error.message); // Log the error
    throw new Error("No matching email found"); // Throw error for better handling
  }
}

module.exports = { registerAccount, getAccountByEmail };
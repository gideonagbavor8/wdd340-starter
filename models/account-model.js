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

// Get by ID
async function getAccountById(accountId) {
  const result = await pool.query("SELECT * FROM account WHERE account_id = $1", [accountId]);
  return result.rows[0];
}

// Update info
async function updateAccountInfo({ account_firstname, account_lastname, account_email, account_id }) {
  const result = await pool.query(
    "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4",
    [account_firstname, account_lastname, account_email, account_id]
  );
  return result;
}

// Update password
async function updatePassword(account_id, hashedPassword) {
  const result = await pool.query(
    "UPDATE account SET password = $1 WHERE account_id = $2",
    [hashedPassword, account_id]
  );
  return result;
}

module.exports = { registerAccount, getAccountByEmail, getAccountById, updateAccountInfo, updatePassword };
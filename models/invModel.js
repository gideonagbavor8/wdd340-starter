invModel.insertClassification = async function (classification_name) {
  const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
  return await pool.query(sql, [classification_name]);
};

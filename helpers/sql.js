const { BadRequestError } = require("../expressError");

/* 
  Helper function, sqlForPartialUpdate(), used to make updates on select queries. 
  
  sqlForPartialUpdate() takes in two arguments: 
    1) an object with the data to update, and 
    2) an object with JavaScript to SQL database commands. 
  
  sqlForPartialUpdate() returns an object with set columns and the value to update.
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

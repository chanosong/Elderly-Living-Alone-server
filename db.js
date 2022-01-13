const maria = require("mysql");
const conn = maria.createConnection({
  host: "14.52.69.42",
  user: "root",
  password: "0000",
  port: 3306,
  database: "elderly",
  dateStrings: "date",
});

module.exports = conn;
require('dotenv').config();

const maria = require("mysql");

const conn = maria.createConnection({
  host: `${process.env.SERVER_URL}`,
  user: "root",
  password: "0000",
  port: 3306,
  database: "elderly",
  dateStrings: "date",
});

module.exports = conn;
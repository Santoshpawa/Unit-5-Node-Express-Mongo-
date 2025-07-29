const fs = require("fs");

function readFile(path) {
  console.log(fs.readFileSync(path, "utf-8"));
}

function appendFile(path, data) {
  fs.appendFileSync(path, data);
  console.log("The data is appended");
}

module.exports = { readFile, appendFile };

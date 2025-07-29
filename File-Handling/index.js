const { readFile, appendFile } = require("./fileOperations");

readFile("./read.txt");

appendFile("./read.txt", "Hello World !");

readFile("./read.txt");

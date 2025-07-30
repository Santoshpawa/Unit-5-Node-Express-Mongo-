// index.js

const express = require("express");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");

const app = express();
const PORT = 3000;

// 1. Read file from local path
// GET /readfile?filepath=path/to/file.txt
app.get("/readfile", (req, res) => {
  const filePath = req.query.filepath;

  if (!filePath) {
    return res.status(400).send("Please provide a 'filepath' query parameter.");
  }

  try {
    const absolutePath = path.resolve(filePath);
    const data = fs.readFileSync(absolutePath, "utf-8");
    res.send(data);
  } catch (error) {
    res.status(500).send("Error reading file: " + error.message);
  }
});

// 2. Parse URL using native Node.js modules
// GET /parseurl?url=https://masaischool.com/course?name=backend&duration=6weeks
app.get("/parseurl", (req, res) => {
  const inputUrl = req.query.url;

  if (!inputUrl) {
    return res.status(400).send("Please provide a 'url' query parameter.");
  }

  try {
    const parsed = new URL(inputUrl);

    // Parsing the query params using querystring (Node < v10)
    const queryParams = querystring.parse(parsed.search.slice(1));

    res.json({
      href: parsed.href,
      protocol: parsed.protocol,
      host: parsed.host,
      pathname: parsed.pathname,
      query: queryParams,
    });
  } catch (error) {
    res.status(400).send("Invalid URL format");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

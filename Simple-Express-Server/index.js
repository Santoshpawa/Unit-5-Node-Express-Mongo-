const express = require("express");
const app = express();
const PORT = 3000;

app.get("/home", (req, res) => {
  res.send("This is home page");
});

app.get("/contactus", (req, res) => {
  res.send("Contact us at contact@support.com");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

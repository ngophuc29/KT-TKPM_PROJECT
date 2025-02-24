const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

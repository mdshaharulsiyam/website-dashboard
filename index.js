const express = require("express");
const path = require("path");

const app = express();
const PORT =  5001;
const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT,  () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

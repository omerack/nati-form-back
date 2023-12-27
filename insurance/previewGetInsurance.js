const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/insurance/preview/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(
    parentOfParentDirectory,
    `${userId}-insurance.pdf`
  );
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

module.exports = router;
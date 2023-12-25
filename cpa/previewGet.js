const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/preview/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(parentOfParentDirectory, `${userId}-preview.pdf`);

  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

router.get("/bituahLeumi/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(
    parentOfParentDirectory,
    `${userId}-bituahLeumi.pdf`
  );

  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

router.get("/agreement/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(
    parentOfParentDirectory,
    `${userId}-agreement.pdf`
  );

  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

router.get("/financialReport/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(
    parentOfParentDirectory,
    `${userId}-financialReport.pdf`
  );

  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

router.get("/BookKeeping/:id", async (req, res) => {
  const userId = req.params.id;

  const parentOfParentDirectory = path.resolve(__dirname, "..");
  const filePath = path.join(
    parentOfParentDirectory,
    `${userId}-BookKeeping.pdf`
  );

  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

module.exports = router;

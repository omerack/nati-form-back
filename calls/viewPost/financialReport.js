const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

async function financialReport(req, res) {
  const {
    name,
    lastName,
    id,
    signature,
    financialReportFee,
    associationName,
  } = req.body;

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  const financialReport = fs.readFileSync("./financialReport.pdf");
  const financialReportDoc = await PDFDocument.load(financialReport);

  financialReportDoc.registerFontkit(fontkit);
  const financialReportFont = await financialReportDoc.embedFont(fontBytes);

  const financialReportPageOne = financialReportDoc.getPages()[0];
  const financialReportPageTwo = financialReportDoc.getPages()[1];

  name &&
    financialReportPageOne.drawText(name, {
      x: 340,
      y: 590,
      size: 13,
      font: financialReportFont,
    });
  lastName &&
    financialReportPageOne.drawText(lastName, {
      x: 300,
      y: 590,
      size: 13,
      font: financialReportFont,
    });
  associationName &&
    financialReportPageOne.drawText(associationName, {
      x: 280,
      y: 590,
      size: 10,
      font: financialReportFont,
    });
  financialReportPageOne.drawText(formattedDate, {
    x: 87,
    y: 718,
    size: 13,
    font: financialReportFont,
  });
  financialReportPageOne.drawText(`${day}`, {
    x: 318,
    y: 654,
    size: 11,
    font: financialReportFont,
  });
  financialReportPageOne.drawText(`${month}`, {
    x: 268,
    y: 654,
    size: 11,
    font: financialReportFont,
  });

  financialReportPageOne.drawText(`${year}`, {
    x: 210,
    y: 654,
    size: 11,
    font: financialReportFont,
  });
  financialReportPageTwo.drawText(financialReportFee, {
    x: 225,
    y: 677,
    size: 13,
    font: financialReportFont,
  });

  const pngsignature4 = await financialReportDoc.embedPng(signature);
  const pngDims4 = pngsignature4.scale(0.2);
  financialReportPageTwo.drawImage(pngsignature4, {
    x: 380,
    y: 570,
    width: pngDims4.width,
    height: pngDims4.height,
  });

  const financialReportModified = await financialReportDoc.save();
  fs.writeFileSync(`${id}-financialReport.pdf`, financialReportModified);
}

module.exports = financialReport;

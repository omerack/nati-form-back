const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

async function agreement(req, res) {
  const {
    name,
    lastName,
    id,
    signature,
    associationName,
  } = req.body;

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  const agreement = fs.readFileSync("./contractual-agreement.pdf");
  const agreementDoc = await PDFDocument.load(agreement);

  agreementDoc.registerFontkit(fontkit);
  const agreementFont = await agreementDoc.embedFont(fontBytes);

  const agreementPageOne = agreementDoc.getPages()[0];
  const agreementPageThree = agreementDoc.getPages()[2];
  name &&
    agreementPageOne.drawText(name, {
      x: 480,
      y: 654,
      size: 13,
      font: agreementFont,
    });
  lastName &&
    agreementPageOne.drawText(lastName, {
      x: 435,
      y: 654,
      size: 13,
      font: agreementFont,
    });
  associationName &&
    agreementPageOne.drawText(associationName, {
      x: 435,
      y: 654,
      size: 11,
      font: agreementFont,
    });
  agreementPageOne.drawText(formattedDate, {
    x: 80,
    y: 703,
    size: 11,
    font: agreementFont,
  });

  name &&
    agreementPageThree.drawText(name, {
      x: 410,
      y: 459,
      size: 13,
      font: agreementFont,
    });
  lastName &&
    agreementPageThree.drawText(lastName, {
      x: 360,
      y: 459,
      size: 13,
      font: agreementFont,
    });
  associationName &&
    agreementPageThree.drawText(associationName, {
      x: 340,
      y: 459,
      size: 11,
      font: agreementFont,
    });

  const pngsignature3 = await agreementDoc.embedPng(signature);
  const pngDims3 = pngsignature3.scale(0.2);
  agreementPageThree.drawImage(pngsignature3, {
    x: 200,
    y: 439,
    width: pngDims3.width,
    height: pngDims3.height,
  });

  const agreementModified = await agreementDoc.save();
  fs.writeFileSync(`${id}-agreement.pdf`, agreementModified);
}

module.exports = agreement;

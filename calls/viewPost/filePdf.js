const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

async function filePdf(req, res) {
  const {
    name,
    lastName,
    id,
    phone,
    email,
    street,
    streetNumber,
    city,
    partnerName,
    partnerLastName,
    partnerId,
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

  const existingPdf = fs.readFileSync("./filepdf.pdf");
  const pdfDoc = await PDFDocument.load(existingPdf);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const spacedId = id.replace(
    /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
    "$1 $2 $3 $4 $5 $6 $7 $8 $9"
  );
  const spacedPartnerId = partnerId
    ? partnerId.replace(
        /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
        "$1 $2 $3 $4 $5 $6 $7 $8 $9"
      )
    : partnerId;
  const spacedPhone = phone.replace(/(\d{3})(\d{1})/, "$1 $2");

  const newPdf = pdfDoc.getPages()[0];
  name && newPdf.drawText(name, { x: 420, y: 625, size: 15, font: customFont });
  lastName &&
    newPdf.drawText(lastName, { x: 350, y: 625, size: 15, font: customFont });
  associationName &&
    newPdf.drawText(associationName, {
      x: 300,
      y: 625,
      size: 15,
      font: customFont,
    });
  newPdf.drawText(spacedId, { x: 153, y: 625, size: 15, font: customFont });
  newPdf.drawText(spacedPhone, { x: 33, y: 625, size: 15, font: customFont });
  newPdf.drawRectangle({
    x: 113,
    y: 590,
    width: 20,
    height: 20,
    color: rgb(1, 1, 1),
    borderColor: rgb(1, 1, 1),
  });
  newPdf.drawText(email, { x: 50, y: 590, size: 15, font: customFont });
  newPdf.drawText(street, { x: 410, y: 590, size: 15, font: customFont });
  newPdf.drawText(streetNumber, { x: 390, y: 590, size: 15, font: customFont });
  newPdf.drawText(city, { x: 270, y: 590, size: 15, font: customFont });
  partnerName &&
    newPdf.drawText(partnerName, {
      x: 330,
      y: 560,
      size: 15,
      font: customFont,
    });
  partnerLastName &&
    newPdf.drawText(partnerLastName, {
      x: 250,
      y: 560,
      size: 15,
      font: customFont,
    });
  spacedPartnerId &&
    newPdf.drawText(spacedPartnerId, {
      x: 35,
      y: 560,
      size: 15,
      font: customFont,
    });
  spacedPartnerId &&
    newPdf.drawText("X", {
      x: 489,
      y: 560,
      size: 11,
      font: customFont,
    });
  newPdf.drawText(formattedDate, {
    x: 430,
    y: 345,
    size: 15,
    font: customFont,
  });
  newPdf.drawText(formattedDate, {
    x: 430,
    y: 150,
    size: 15,
    font: customFont,
  });
  const pngsignature = await pdfDoc.embedPng(signature);

  const pngDims = pngsignature.scale(0.2);
  newPdf.drawImage(pngsignature, {
    x: 40,
    y: 330,
    width: pngDims.width,
    height: pngDims.height,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${id}-preview.pdf`, modifiedPdf);
}

module.exports = filePdf;

const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

async function bookKeeping(req, res) {
  const { name, lastName, id, signature, BookKeepingFee, associationName } =
    req.body;

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  const BookKeeping = fs.readFileSync("./BookKeeping.pdf");
  const BookKeepingDoc = await PDFDocument.load(BookKeeping);

  BookKeepingDoc.registerFontkit(fontkit);
  const BookKeepingFont = await BookKeepingDoc.embedFont(fontBytes);

  const BookKeepingPageOne = BookKeepingDoc.getPages()[0];
  const BookKeepingPageTwo = BookKeepingDoc.getPages()[1];

  name &&
    BookKeepingPageOne.drawText(name, {
      x: 330,
      y: 569,
      size: 13,
      font: BookKeepingFont,
    });
  lastName &&
    BookKeepingPageOne.drawText(lastName, {
      x: 290,
      y: 569,
      size: 13,
      font: BookKeepingFont,
    });
  associationName &&
    BookKeepingPageOne.drawText(associationName, {
      x: 300,
      y: 569,
      size: 10,
      font: BookKeepingFont,
    });
  BookKeepingPageOne.drawText(formattedDate, {
    x: 87,
    y: 716,
    size: 13,
    font: BookKeepingFont,
  });
  BookKeepingPageOne.drawText(`${day}`, {
    x: 315,
    y: 648,
    size: 11,
    font: BookKeepingFont,
  });
  BookKeepingPageOne.drawText(`${month}`, {
    x: 268,
    y: 648,
    size: 11,
    font: BookKeepingFont,
  });

  BookKeepingPageOne.drawText(`${year}`, {
    x: 215,
    y: 648,
    size: 11,
    font: BookKeepingFont,
  });
  BookKeepingPageTwo.drawText(BookKeepingFee, {
    x: 186,
    y: 593,
    size: 11,
    font: BookKeepingFont,
  });

  const pngsignature5 = await BookKeepingDoc.embedPng(signature);
  const pngDims5 = pngsignature5.scale(0.2);
  BookKeepingPageTwo.drawImage(pngsignature5, {
    x: 380,
    y: 430,
    width: pngDims5.width,
    height: pngDims5.height,
  });

  const BookKeepingModified = await BookKeepingDoc.save();
  fs.writeFileSync(`${id}-BookKeeping.pdf`, BookKeepingModified);
}

module.exports = bookKeeping;

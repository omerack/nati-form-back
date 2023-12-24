const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

async function bituahLeumi(req, res) {
    const {
        name,
        lastName,
        id,
        phone,
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

  const bituahLeumi = fs.readFileSync("./bituah-leumi.pdf");
  const bituahLeumiDoc = await PDFDocument.load(bituahLeumi);

  bituahLeumiDoc.registerFontkit(fontkit);
  const bituahLeumiFont = await bituahLeumiDoc.embedFont(fontBytes);

  bituahLeumiDoc.removePage(0);
  const bituahLeumiPageOne = bituahLeumiDoc.getPages()[1];
  const bituahLeumiPageTwo = bituahLeumiDoc.getPages()[2];
  name &&
    bituahLeumiPageOne.drawText(name, {
      x: 330,
      y: 260,
      size: 15,
      font: bituahLeumiFont,
    });
  lastName &&
    bituahLeumiPageOne.drawText(lastName, {
      x: 450,
      y: 260,
      size: 15,
      font: bituahLeumiFont,
    });
  associationName &&
    bituahLeumiPageOne.drawText(associationName, {
      x: 400,
      y: 260,
      size: 15,
      font: bituahLeumiFont,
    });
  const spacedId2 = id.replace(
    /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
    "$1  $2  $3  $4  $5  $6  $7  $8  $9"
  );
  bituahLeumiPageOne.drawText(spacedId2, {
    x: 105,
    y: 260,
    size: 15,
    font: bituahLeumiFont,
  });
  const spacedPhone2 = phone.replace(
    /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
    "$1 $2 $3  $4 $5 $6 $7 $8 $9 $10"
  );
  bituahLeumiPageOne.drawText(spacedPhone2, {
    x: 280,
    y: 215,
    size: 15,
    font: bituahLeumiFont,
  });
  bituahLeumiPageTwo.drawText(formattedDate, {
    x: 430,
    y: 623,
    size: 15,
    font: bituahLeumiFont,
  });

  const pngsignature2 = await bituahLeumiDoc.embedPng(signature);
  const pngDims2 = pngsignature2.scale(0.2);
  bituahLeumiPageTwo.drawImage(pngsignature2, {
    x: 210,
    y: 610,
    width: pngDims2.width,
    height: pngDims2.height,
  });

  const bituahLeumiModified = await bituahLeumiDoc.save();
  fs.writeFileSync(`${id}-bituahLeumi.pdf`, bituahLeumiModified);
}

module.exports = bituahLeumi;

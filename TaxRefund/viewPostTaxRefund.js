const router = require("../cpa/previewGet");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

router.post("/TaxRefund/view", async (req, res) => {
  const { name, lastName, id, signature, phone, email, company } = req.body;

  /*טופס בקשה לרישום ייצוג*/

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  let taxRefundCompany = null;

  if (company === "ackerman") {
    taxRefundCompany = "./taxRefund - ackerman.pdf";
  } else {
    taxRefundCompany = "./taxRefund - switch.pdf";
  }

  const existingPdf = fs.readFileSync(taxRefundCompany);
  const pdfDoc = await PDFDocument.load(existingPdf);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  fullName = `${name} ${lastName}`;
  console.log(fullName);

  const newPdfPageOne = pdfDoc.getPages()[0];
  const newPdfPageTwo = pdfDoc.getPages()[1];
  newPdfPageOne.drawText(fullName, {
    x: 340,
    y: 606,
    size: 11,
    font: customFont,
  });
  newPdfPageOne.drawText(id, { x: 240, y: 606, size: 11, font: customFont });
  newPdfPageOne.drawText(formattedDate, {
    x: 70,
    y: 745,
    size: 15,
    font: customFont,
  });
  newPdfPageOne.drawText(`${day}`, {
    x: 325,
    y: 669,
    size: 11,
    font: customFont,
  });
  newPdfPageOne.drawText(`${month}`, {
    x: 273,
    y: 669,
    size: 11,
    font: customFont,
  });
  newPdfPageOne.drawText(`${year}`, {
    x: 205,
    y: 669,
    size: 11,
    font: customFont,
  });

  newPdfPageOne.drawText(phone, { x: 350, y: 580, size: 11, font: customFont });
  newPdfPageOne.drawText(email, { x: 150, y: 580, size: 11, font: customFont });

  newPdfPageTwo.drawText(formattedDate, {
    x: 400,
    y: 600,
    size: 13,
    font: customFont,
  });
  const pngsignature = await pdfDoc.embedPng(signature);
  const pngDims = pngsignature.scale(0.2);
  newPdfPageTwo.drawImage(pngsignature, {
    x: 360,
    y: 523,
    width: pngDims.width,
    height: pngDims.height,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${id}-taxRefund.pdf`, modifiedPdf);

  const files = req.files["fileUploads1[]"];

  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      fs.writeFile(
        `./${id} - ${index + 1}.${file.name.split(".")[1]}`,
        file.data,
        (err) => {
          if (err) {
            return res.status(500).send(err);
          }
        }
      );
    });
  } else {
    fs.writeFile(
      `./${id} - 1.${files.name.split(".")[1]}`,
      files.data,
      (err) => {
        if (err) {
          return res.status(500).send(err);
        }
      }
    );
  }

  res.send({ success: true });
});

module.exports = router;

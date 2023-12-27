const router = require("../cpa/previewGet");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");

router.post("/insurance/view", async (req, res) => {
  const { name, lastName, id, signature, phone, email, insuranceFee } =
    req.body;

    const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  const existingPdf = fs.readFileSync("./insurance.pdf");
  const pdfDoc = await PDFDocument.load(existingPdf);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  fullName = `${name} ${lastName}`;
  console.log(fullName);

  const newPdf = pdfDoc.getPages()[0];
  newPdf.drawText(fullName, { x: 335, y: 585, size: 11, font: customFont });
  newPdf.drawText(id, { x: 240, y: 585, size: 11, font: customFont });
  newPdf.drawText(formattedDate, {
    x: 70,
    y: 730,
    size: 15,
    font: customFont,
  });
  newPdf.drawText(`${day}`, {
    x: 325,
    y: 647,
    size: 11,
    font: customFont,
  });
  newPdf.drawText(`${month}`, {
    x: 273,
    y: 647,
    size: 11,
    font: customFont,
  });
  newPdf.drawText(`${year}`, {
    x: 210,
    y: 647,
    size: 11,
    font: customFont,
  });

  newPdf.drawText(phone, { x: 335, y: 560, size: 11, font: customFont });
  newPdf.drawText(email, { x: 150, y: 560, size: 11, font: customFont });
  newPdf.drawText(insuranceFee, { x: 240, y: 269, size: 11, font: customFont });

  const pngsignature = await pdfDoc.embedPng(signature);
  const pngDims = pngsignature.scale(0.2);
  newPdf.drawImage(pngsignature, {
    x: 380,
    y: 110,
    width: pngDims.width,
    height: pngDims.height,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${id}-insurance.pdf`, modifiedPdf);

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

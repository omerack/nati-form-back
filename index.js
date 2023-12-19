const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const path = require("path");
const nodeMailer = require("nodemailer");
const { readdir } = require("fs/promises");
const fileUpload = require("express-fileupload");

const app = express();
const port = 3001;

const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const formattedDate = `${day}/${month}/${year}`;

const fontPath = "./Rubik-Light.ttf";
const fontBytes = fs.readFileSync(fontPath);

app.use(express.static("public"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(
  cors({
    origin: "*",
  })
);

const findByName = async (dir, name) => {
  const matchedFiles = [];

  const files = await readdir(dir);

  for (const file of files) {
    if (file.includes(name)) {
      matchedFiles.push(file);
    }
  }

  return matchedFiles;
};

function sendMail(files) {
  return new Promise((resolve, reject) => {
    var transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "automaticform.gilad@gmail.com",
        pass: "vpri iizx vjbl wfxl",
      },
    });

    const mail_configs = {
      from: "automaticform.gilad@gmail.com",
      to: "omeracker1@gmail.com", //*Office@cpa-ag.co.il omeracker1@gmail.com*//
      attachments: [
        ...files.map((upload) => ({
          path: upload,
        })),
      ],
      subject: "הודעה חדשה",
      text: "קיבלת פרטים חדשים ",
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: "an error has occured" });
      }
      return resolve({ message: "Email sent succesfully" });
    });
  });
}

app.post("/view", async (req, res) => {
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
    BookKeepingFee,
    financialReportFee,
  } = req.body;

  console.log(req.body);

  /*טופס בקשה לרישום ייצוג*/

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
  newPdf.drawText(name, { x: 420, y: 625, size: 15, font: customFont });
  newPdf.drawText(lastName, { x: 350, y: 625, size: 15, font: customFont });
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

  /*טופס ביטוח לאומי*/

  const bituahLeumi = fs.readFileSync("./bituah-leumi.pdf");
  const bituahLeumiDoc = await PDFDocument.load(bituahLeumi);

  bituahLeumiDoc.registerFontkit(fontkit);
  const bituahLeumiFont = await bituahLeumiDoc.embedFont(fontBytes);

  bituahLeumiDoc.removePage(0);
  const bituahLeumiPageOne = bituahLeumiDoc.getPages()[1];
  const bituahLeumiPageTwo = bituahLeumiDoc.getPages()[2];
  bituahLeumiPageOne.drawText(name, {
    x: 330,
    y: 260,
    size: 15,
    font: bituahLeumiFont,
  });
  bituahLeumiPageOne.drawText(lastName, {
    x: 450,
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

  /*טופס הסכם התקשרות*/

  const agreement = fs.readFileSync("./contractual-agreement.pdf");
  const agreementDoc = await PDFDocument.load(agreement);

  agreementDoc.registerFontkit(fontkit);
  const agreementFont = await agreementDoc.embedFont(fontBytes);

  const agreementPageOne = agreementDoc.getPages()[0];
  const agreementPageThree = agreementDoc.getPages()[2];
  agreementPageOne.drawText(name, {
    x: 480,
    y: 654,
    size: 13,
    font: agreementFont,
  });
  agreementPageOne.drawText(lastName, {
    x: 435,
    y: 654,
    size: 13,
    font: agreementFont,
  });
  agreementPageOne.drawText(formattedDate, {
    x: 80,
    y: 703,
    size: 11,
    font: agreementFont,
  });

  agreementPageThree.drawText(name, {
    x: 410,
    y: 459,
    size: 13,
    font: agreementFont,
  });
  agreementPageThree.drawText(lastName, {
    x: 360,
    y: 459,
    size: 13,
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

  /*טופס שירותי הנהלת חשבונות*/

  const BookKeeping = fs.readFileSync("./BookKeeping.pdf");
  const BookKeepingDoc = await PDFDocument.load(BookKeeping);

  BookKeepingDoc.registerFontkit(fontkit);
  const BookKeepingFont = await BookKeepingDoc.embedFont(fontBytes);

  const BookKeepingPageOne = BookKeepingDoc.getPages()[0];
  const BookKeepingPageTwo = BookKeepingDoc.getPages()[1];

  BookKeepingPageOne.drawText(name, {
    x: 330,
    y: 569,
    size: 13,
    font: BookKeepingFont,
  });
  BookKeepingPageOne.drawText(lastName, {
    x: 290,
    y: 569,
    size: 13,
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

  /*טופס שירות דוח כספי*/

  const financialReport = fs.readFileSync("./financialReport.pdf");
  const financialReportDoc = await PDFDocument.load(financialReport);

  financialReportDoc.registerFontkit(fontkit);
  const financialReportFont = await financialReportDoc.embedFont(fontBytes);

  const financialReportPageOne = financialReportDoc.getPages()[0];
  const financialReportPageTwo = financialReportDoc.getPages()[1];

  financialReportPageOne.drawText(name, {
    x: 340,
    y: 590,
    size: 13,
    font: financialReportFont,
  });
  financialReportPageOne.drawText(lastName, {
    x: 300,
    y: 590,
    size: 13,
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
    x: 205,
    y: 680,
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

  const files = req.files["fileUploads[]"];

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

app.get("/preview/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-preview.pdf`);
  const filePath = path.join(__dirname, `${userId}-preview.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.get("/bituahLeumi/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-bituahLeumi.pdf`);
  const filePath = path.join(__dirname, `${userId}-bituahLeumi.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.get("/agreement/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-agreement.pdf`);
  const filePath = path.join(__dirname, `${userId}-agreement.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.get("/BookKeeping/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-BookKeeping.pdf`);
  const filePath = path.join(__dirname, `${userId}-BookKeeping.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.get("/financialReport/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-financialReport.pdf`);
  const filePath = path.join(__dirname, `${userId}-financialReport.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.post(`/submit/:id`, async (req, res) => {
  const { id } = req.params;

  findByName("./", id).then((files) => {
    sendMail(files)
      .then((response) => {
        console.log(response.message);

        files.forEach((file) => {
          fs.unlink(file, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Error deleting file: ${file}`, unlinkErr);
            } else {
              console.log(`Deleted file: ${file}`);
            }
          });
        });

        res.send({ success: true });
      })
      .catch((error) => {
        console.error(error.message);
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

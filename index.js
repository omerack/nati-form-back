const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const { readdir } = require("fs/promises");
const nodeMailer = require("nodemailer");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const directory = path.join(__dirname, "public");

const monthsNames = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const today = new Date();
const day = today.getDate();
const month = today.getMonth();
const year = today.getFullYear();
const formattedDate = `${day}/${month}/${year}`;
const findByName = async (dir, name) => {
  const matchedFiles = [];

  const files = await readdir(dir);

  for (const file of files) {
    if (file.includes(name)) {
      matchedFiles.push(`${directory}/${file}`);
    }
  }

  return matchedFiles;
};

function sendMail(files) {
  return new Promise((resolve, reject) => {
    var transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "automatic.form.is@gmail.com",
        pass: "eddp sret fzcz tnhh",
      },
    });

    const mail_configs = {
      from: "automatic.form.is@gmail.com",
      to: "nati@segoal.com",
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
        return reject({ message: "an error has occured" });
      }
      return resolve({ message: "Email sent succesfully" });
    });
  });
}

app.post("/submit", async (req, res) => {
  const { name, id, sex, signature } = req.body;

  let pdfPath;

  if (sex === "female") {
    pdfPath = `${directory}/power of attorney - female.pdf`;
  } else {
    pdfPath = `${directory}/power of attorney - male.pdf`;
  }
  /* יפוי כוח */

  const existingPdf = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdf);

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

  pdfDoc.registerFontkit(fontkit);
  const customFont = await pdfDoc.embedFont(fontBytes);

  const newPdf = pdfDoc.getPages()[0];
  newPdf.drawText(name, { x: 420, y: 785, size: 10, font: customFont });
  newPdf.drawText(name, { x: 105, y: 125, size: 12, font: customFont });
  newPdf.drawText(id, { x: 323, y: 785, size: 11, font: customFont });
  newPdf.drawText(`${day}`, { x: 320, y: 184, size: 11, font: customFont });
  newPdf.drawText(`${year}`, { x: 170, y: 184, size: 11, font: customFont });
  newPdf.drawText(`${monthsNames[month]}`, {
    x: 230,
    y: 184,
    size: 11,
    font: customFont,
  });

  const pngsignature = await pdfDoc.embedPng(signature);
  const pngDims = pngsignature.scale(0.2);
  newPdf.drawImage(pngsignature, {
    x: 60,
    y: 150,
    width: pngDims.width,
    height: pngDims.height,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${directory}/${id}-preview.pdf`, modifiedPdf);

  // /* שכר טרחה */

  // const feesPdf = fs.readFileSync("./ייפוי כוח.pdf");
  // const feesDoc = await PDFDocument.load(feesPdf);

  // feesDoc.registerFontkit(fontkit);
  // const feesFont = await feesDoc.embedFont(fontBytes);

  // const feesPageOne = feesDoc.getPages()[0];
  // const feesPageTwo = feesDoc.getPages()[1];
  // feesPageTwo.drawText(name, { x: 400, y: 381, size: 13, font: feesFont });
  // feesPageTwo.drawText(id, { x: 380, y: 347, size: 13, font: feesFont });
  // feesPageOne.drawText(formattedDate, {
  //   x: 430,
  //   y: 805,
  //   size: 15,
  //   font: feesFont,
  // });

  // const pngsignature2 = await feesDoc.embedPng(signature);
  // const pngDims2 = pngsignature.scale(0.2);
  // feesPageTwo.drawImage(pngsignature2, {
  //   x: 350,
  //   y: 416,
  //   width: pngDims2.width,
  //   height: pngDims2.height,
  // });

  // const feesModified = await feesDoc.save();
  // fs.writeFileSync(`${directory}/${id}-fees.pdf`, feesModified);

    findByName(directory, id).then((files) => {
      sendMail(files)
        .then((response) => {
          console.log(files);
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

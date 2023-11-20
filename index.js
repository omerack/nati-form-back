const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const path = require("path");
const multer = require("multer");
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

app.use(express.static("public"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(cors());

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
      to: "giladac@gmail.com",
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
  } = req.body;

  const existingPdf = fs.readFileSync("./filepdf.pdf");
  const pdfDoc = await PDFDocument.load(existingPdf);

  const fontPath = "./Rubik-Light.ttf";
  const fontBytes = fs.readFileSync(fontPath);

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

  console.log(req.files);
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

app.get("/preview/:id", async (req, res) => {
  const userId = req.params.id;

  fs.readFileSync(`${userId}-preview.pdf`);
  const filePath = path.join(__dirname, `${userId}-preview.pdf`);
  res.set("Content-Type", "application/pdf");
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

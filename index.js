// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { PDFDocument, rgb } = require("pdf-lib");
// const fs = require("fs");
// const fontkit = require("@pdf-lib/fontkit");
// const path = require("path");
// const multer = require("multer");
// const nodeMailer = require("nodemailer");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./");
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// const app = express();
// const port = 3001;

// const today = new Date();
// const day = today.getDate();
// const month = today.getMonth() + 1;
// const year = today.getFullYear();

// const formattedDate = `${day}/${month}/${year}`;

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
// app.use(cors());

// function sendMail(fileUploads, infoForm) {
//   return new Promise((resolve, reject) => {
//     var transporter = nodeMailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "omeracker1@gmail.com",
//         pass: "ulcq loln lbyy qiaw",
//       },
//     });

//     const mail_configs = {
//       from: "omeracker1@gmail.com",
//       to: "omeracker1@gmail.com",
//       attachments: [
//         ...fileUploads.map((upload) => ({
//           path: upload,
//         })),
//         {
//           path: infoForm,
//         },
//       ],
//       subject: "הודעה חדשה",
//       text: "קיבלת פרטים חדשים ",
//     };
//     transporter.sendMail(mail_configs, function (error, info) {
//       if (error) {
//         console.log(error);
//         return reject({ message: "an error has occured" });
//       }
//       return resolve({ message: "Email sent succesfully" });
//     });
//   });
// }

// app.post("/submit", upload.array("fileUploads"), async (req, res) => {
//   const {
//     name,
//     lastName,
//     id,
//     phone,
//     email,
//     street,
//     streetNumber,
//     city,
//     partnerName,
//     partnerLastName,
//     partnerId,
//     signature,
//     fileUploads,
//   } = req.body;

//   const existingPdf = fs.readFileSync("./filepdf.pdf");
//   const pdfDoc = await PDFDocument.load(existingPdf);

//   const fontPath = "./Rubik-Light.ttf";
//   const fontBytes = fs.readFileSync(fontPath);

//   pdfDoc.registerFontkit(fontkit);
//   const customFont = await pdfDoc.embedFont(fontBytes);

//   const spacedId = id.replace(
//     /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
//     "$1 $2 $3 $4 $5 $6 $7 $8 $9"
//   );
//   const spacedPartnerId = partnerId
//     ? partnerId.replace(
//         /(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})(\d{1})/,
//         "$1 $2 $3 $4 $5 $6 $7 $8 $9"
//       )
//     : partnerId;
//   const spacedPhone = phone.replace(/(\d{3})(\d{1})/, "$1 $2");

//   const newPdf = pdfDoc.getPages()[0];
//   newPdf.drawText(name, { x: 420, y: 625, size: 15, font: customFont });
//   newPdf.drawText(lastName, { x: 350, y: 625, size: 15, font: customFont });
//   newPdf.drawText(spacedId, { x: 153, y: 625, size: 15, font: customFont });
//   newPdf.drawText(spacedPhone, { x: 33, y: 625, size: 15, font: customFont });
//   newPdf.drawRectangle({
//     x: 113,
//     y: 590,
//     width: 20,
//     height: 20,
//     color: rgb(1, 1, 1),
//     borderColor: rgb(1, 1, 1),
//   });
//   newPdf.drawText(email, { x: 50, y: 590, size: 15, font: customFont });
//   newPdf.drawText(street, { x: 400, y: 590, size: 15, font: customFont });
//   newPdf.drawText(streetNumber, { x: 380, y: 590, size: 15, font: customFont });
//   newPdf.drawText(city, { x: 330, y: 590, size: 15, font: customFont });
//   partnerName &&
//     newPdf.drawText(partnerName, {
//       x: 330,
//       y: 560,
//       size: 15,
//       font: customFont,
//     });
//   partnerLastName &&
//     newPdf.drawText(partnerLastName, {
//       x: 250,
//       y: 560,
//       size: 15,
//       font: customFont,
//     });
//   spacedPartnerId &&
//     newPdf.drawText(spacedPartnerId, {
//       x: 35,
//       y: 560,
//       size: 15,
//       font: customFont,
//     });
//   spacedPartnerId &&
//     newPdf.drawText("X", {
//       x: 489,
//       y: 560,
//       size: 11,
//       font: customFont,
//     });
//   newPdf.drawText(formattedDate, {
//     x: 430,
//     y: 345,
//     size: 15,
//     font: customFont,
//   });
//   newPdf.drawText(formattedDate, {
//     x: 430,
//     y: 150,
//     size: 15,
//     font: customFont,
//   });
//   const pngsignature = await pdfDoc.embedPng(signature);
//   const pngDims = pngsignature.scale(0.2);
//   newPdf.drawImage(pngsignature, {
//     x: 40,
//     y: 330,
//     width: pngDims.width,
//     height: pngDims.height,
//   });

//   fileUploads.forEach((imageData, index) => {
//     const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

//     fs.writeFile(`${id} ${index + 1}.png`, base64Data, "base64", (err) => {
//       if (err) throw err;
//       console.log(`${name} ${index + 1} has been saved!`);
//     });
//   });

//   const modifiedPdf = await pdfDoc.save();
//   fs.writeFileSync(`${id}-preview.pdf`, modifiedPdf);

//   const infoForm = `${id}-preview.pdf`;

//   sendMail(fileUploads, infoForm)
//     .then((response) => {
//       console.log(response.message);
//     })
//     .catch((error) => {
//       console.error(error.message);
//     });

//   res.send("Form data received successfully");
// });

// app.get("/preview/:id", async (req, res) => {
//   const userId = req.params.id;

//   fs.readFileSync(`${userId}-preview.pdf`);
//   const filePath = path.join(__dirname, `${userId}-preview.pdf`);
//   res.set("Content-Type", "application/pdf");
//   res.sendFile(filePath);
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

module.exports = async function ({ req, res }) {
// if (
//   req.method === "POST" &&
//   req.headers["content-type"] === "application/x-www-form-urlencoded"
// ) {
//   const formData = querystring.parse(req.body);
//   console.log(formData);

//   return res.send("Message sent");
// }

return res.send("dick");
};

const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const nodeMailer = require("nodemailer");
const { readdir } = require("fs/promises");

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

function sendMail(files, name, lastName, id) {
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
      to: "Office@cpa-ag.co.il",
      attachments: [
        ...files.map((upload) => ({
          path: upload,
        })),
      ],
      subject: `${name} ${lastName}  ${id}`,
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

async function submitPostInsurance(req, res) {
  const { id, name, lastName } = req.body;

  const giladSignatureFile = fs.readFileSync("./giladSignature-insurance.png");

  const existingPdf = fs.readFileSync(`${id}-insurance.pdf`);
  const pdfDoc = await PDFDocument.load(existingPdf);

  const existingPdfpageOne = pdfDoc.getPages()[0];
  const giladSignature = await pdfDoc.embedPng(giladSignatureFile);
  existingPdfpageOne.drawImage(giladSignature, {
    x: 140,
    y: 105,
    width: giladSignature.width / 14,
    height: giladSignature.height / 14,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${id}-insurance.pdf`, modifiedPdf);

  findByName("./", id).then((files) => {
    sendMail(files, name, lastName, id)
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
}

module.exports = submitPostInsurance;

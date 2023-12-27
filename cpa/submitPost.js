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

function sendMail(files, name, lastName, associationName, id) {
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
      subject:
        name &&
        lastName !== "undefined" &&
        name.trim() !== "" &&
        lastName.trim() !== ""
          ? `${name} ${lastName}  ${id}`
          : `${associationName} ${id}`,

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

async function submitPost(req, res) {
  const { id, name, lastName, associationName } = req.body;

  const giladSignatureFile = fs.readFileSync("./giladSignature.png");
  const giladStampFile = fs.readFileSync("./giladStamp.png");

  const existingPdf = fs.readFileSync(`${id}-preview.pdf`);
  const pdfDoc = await PDFDocument.load(existingPdf);

  const existingPdfpageOne = pdfDoc.getPages()[0];
  const giladSignature1 = await pdfDoc.embedPng(giladSignatureFile);
  existingPdfpageOne.drawImage(giladSignature1, {
    x: 25,
    y: 130,
    width: giladSignature1.width / 3,
    height: giladSignature1.height / 3,
  });
  const giladStamp1 = await pdfDoc.embedPng(giladStampFile);
  const giladStamppngDims1 = giladStamp1.scale(0.1);

  existingPdfpageOne.drawImage(giladStamp1, {
    x: 110,
    y: 150,
    width: giladStamppngDims1.width,
    height: giladStamppngDims1.height,
  });

  const modifiedPdf = await pdfDoc.save();
  fs.writeFileSync(`${id}-preview.pdf`, modifiedPdf);

  const bituahLeumi = fs.readFileSync(`./${id}-bituahLeumi.pdf`);
  const bituahLeumiDoc = await PDFDocument.load(bituahLeumi);

  const bituahLeumipageTwo = bituahLeumiDoc.getPages()[1];
  const giladSignature2 = await bituahLeumiDoc.embedPng(giladSignatureFile);
  bituahLeumipageTwo.drawImage(giladSignature2, {
    x: 370,
    y: 570,
    width: giladSignature2.width / 3,
    height: giladSignature2.height / 3,
  });
  const giladStamp2 = await bituahLeumiDoc.embedPng(giladStampFile);
  const giladStamppngDims2 = giladStamp1.scale(0.1);

  bituahLeumipageTwo.drawImage(giladStamp2, {
    x: 380,
    y: 555,
    width: giladStamppngDims2.width,
    height: giladStamppngDims2.height,
  });
  const bituahLeumiModified = await bituahLeumiDoc.save();
  fs.writeFileSync(`${id}-bituahLeumi.pdf`, bituahLeumiModified);

  const agreement = fs.readFileSync(`./${id}-agreement.pdf`);
  const agreementDoc = await PDFDocument.load(agreement);

  const agreementpageThree = agreementDoc.getPages()[2];
  const giladSignature3 = await agreementDoc.embedPng(giladSignatureFile);
  agreementpageThree.drawImage(giladSignature3, {
    x: 90,
    y: 525,
    width: giladSignature3.width / 3,
    height: giladSignature3.height / 3,
  });

  const giladStamp3 = await agreementDoc.embedPng(giladStampFile);
  const giladStamppngDims3 = giladStamp1.scale(0.1);

  agreementpageThree.drawImage(giladStamp3, {
    x: 100,
    y: 510,
    width: giladStamppngDims3.width,
    height: giladStamppngDims3.height,
  });

  const agreementModified = await agreementDoc.save();
  fs.writeFileSync(`${id}-agreement.pdf`, agreementModified);

  const BookKeeping = fs.readFileSync(`./${id}-BookKeeping.pdf`);
  const BookKeepingDoc = await PDFDocument.load(BookKeeping);

  const BookKeepingpageTwo = BookKeepingDoc.getPages()[1];
  const giladSignature4 = await BookKeepingDoc.embedPng(giladSignatureFile);
  BookKeepingpageTwo.drawImage(giladSignature4, {
    x: 160,
    y: 415,
    width: giladSignature4.width / 3,
    height: giladSignature4.height / 3,
  });

  const giladStamp4 = await BookKeepingDoc.embedPng(giladStampFile);
  const giladStamppngDims4 = giladStamp1.scale(0.1);

  BookKeepingpageTwo.drawImage(giladStamp4, {
    x: 160,
    y: 470,
    width: giladStamppngDims4.width,
    height: giladStamppngDims4.height,
  });

  const BookKeepingModified = await BookKeepingDoc.save();
  fs.writeFileSync(`${id}-BookKeeping.pdf`, BookKeepingModified);

  const financialReport = fs.readFileSync(`${id}-financialReport.pdf`);
  const financialReportDoc = await PDFDocument.load(financialReport);

  const financialReportpageTwo = financialReportDoc.getPages()[1];
  const giladSignature5 = await financialReportDoc.embedPng(giladSignatureFile);
  financialReportpageTwo.drawImage(giladSignature5, {
    x: 130,
    y: 562,
    width: giladSignature5.width / 3,
    height: giladSignature5.height / 3,
  });

  const giladStamp5 = await financialReportDoc.embedPng(giladStampFile);
  const giladStamppngDims5 = giladStamp1.scale(0.1);

  financialReportpageTwo.drawImage(giladStamp5, {
    x: 140,
    y: 610,
    width: giladStamppngDims5.width,
    height: giladStamppngDims5.height,
  });

  const financialReportModified = await financialReportDoc.save();
  fs.writeFileSync(`${id}-financialReport.pdf`, financialReportModified);

  findByName("./", id).then((files) => {
    sendMail(files, name, lastName, associationName, id)
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

module.exports = submitPost;

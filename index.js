const express = require("express");
const cors = require("cors");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const path = require("path");

const fileUpload = require("express-fileupload");
const uploadedFiles = require("./calls/viewPost/uploadedFiles");
const filePdf = require("./calls/viewPost/filePdf");
const bituahLeumi = require("./calls/viewPost/bituahLeumi");
const agreement = require("./calls/viewPost/agreement");
const bookKeeping = require("./calls/viewPost/BookKeeping");
const financialReport = require("./calls/viewPost/financialReport");
const previewGet = require("./calls/previewGet");
const submitPost = require("./calls/submitPost");

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
app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(cors());



app.post("/view", async (req, res) => {
  try {
    await Promise.all([
      /*העלאת המסמכים*/
      uploadedFiles(req, res),

      /*טופס בקשה לרישום ייצוג*/
      filePdf(req, res),

      /*טופס ביטוח לאומי*/
      bituahLeumi(req, res),

      /*טופס הסכם התקשרות*/
      agreement(req, res),

      // /*טופס שירותי הנהלת חשבונות*/
      bookKeeping(req, res),

      /*טופס שירות דוח כספי*/
      financialReport(req, res),
    ]);

    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: "An error occurred." });
  }
});

app.use("/", previewGet);

app.post(`/submit`, async (req, res) => {
  try {
    await Promise.all([submitPost(req, res)]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: "An error occurred." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const viewPostInsurance = require("./insurance/viewPostInsurance");
const previewGetInsurance = require("./insurance/previewGetInsurance");
const fileUpload = require("express-fileupload");
const uploadedFiles = require("./cpa/viewPost/uploadedFiles");
const filePdf = require("./cpa/viewPost/filePdf");
const bituahLeumi = require("./cpa/viewPost/bituahLeumi");
const agreement = require("./cpa/viewPost/agreement");
const bookKeeping = require("./cpa/viewPost/BookKeeping");
const financialReport = require("./cpa/viewPost/financialReport");
const previewGet = require("./cpa/previewGet");
const submitPost = require("./cpa/submitPost");
const submitPostInsurance = require("./insurance/submitPostInsurance");
const viewPostTaxRefund = require("./TaxRefund/viewPostTaxRefund");
const previewGetTaxRefund = require("./TaxRefund/previewGetTaxRefund");
const submitPostTaxRefund = require("./TaxRefund/submitPostTaxRefund");

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

/* ראיית חשבון */

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
0.0;

app.use("/", previewGet);

app.post(`/submit`, async (req, res) => {
  try {
    await Promise.all([submitPost(req, res)]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: "An error occurred." });
  }
});

/* ביטוח*/

app.use("/", viewPostInsurance);

app.use("/", previewGetInsurance);

app.post(`/insurance/submit`, async (req, res) => {
  try {
    await Promise.all([submitPostInsurance(req, res)]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: "An error occurred." });
  }
});

/* החזר מס*/

app.use("/", viewPostTaxRefund);

app.use("/", previewGetTaxRefund);

app.post(`/taxRefund/submit`, async (req, res) => {
  try {
    await Promise.all([submitPostTaxRefund(req, res)]);
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error: "An error occurred." });
  }
});

app.post("/console", (req, res) => {
  console.log("cron job works");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

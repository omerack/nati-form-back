const fs = require("fs");

function uploadedFiles(req, res) {
  const { id } = req.body;

  const filesArrays = req.files;

  Object.keys(filesArrays).forEach((filesKey) => {
    const files = filesArrays[filesKey];

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        const fileName = `./${id}-${filesKey.replace("[]", "")}-${index + 1}.${
          file.name.split(".")[1]
        }`;

        fs.writeFile(fileName, file.data, (err) => {
          if (err) {
            return res.status(500).send(err);
          }
        });
      });
    } else {
      const fileName = `./${id}-${filesKey.replace("[]", "")}-1.${
        files.name.split(".")[1]
      }`;

      fs.writeFile(fileName, files.data, (err) => {
        if (err) {
          return res.status(500).send(err);
        }
      });
    }
  });
}

module.exports = uploadedFiles;

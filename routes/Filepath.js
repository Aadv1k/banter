const { MIME } = require("../app/constants");
const { renderView } = require("../app/common");
const path = require("path");
const { existsSync, readFileSync } = require("fs");

module.exports = (req, res) => {
  const filename = req.url;

  const ext = filename.split(".").pop();
  if (!MIME[ext]) {
    renderView(res, "404.ejs", 404);
    return;
  }

  const filepath = path.join(__dirname, "../public", filename);

  if (existsSync(filepath)) {
    let file = readFileSync(filepath);
    res.writeHead(200, { "Content-type": MIME[ext] });
    res.write(file);
  } else {
    renderView(res, "404.ejs", 404);
  }
  res.end();
};

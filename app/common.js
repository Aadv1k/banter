const { MIME } = require("./constants");

const { existsSync, readFileSync } = require("fs");
const ejs = require("ejs");
const path = require("path");

const crypto = require("crypto");
const { Store } = require("../models/MemoryStore");
const cookie = require("cookie");

function sendJsonErr(res, err) {
  res.writeHead(err.code, { "Content-type": MIME.json });
  res.write(JSON.stringify(err));
  res.end();
}

function newID(len) {
  crypto.randomBytes(len ?? 8).toString("hex");
}

function isCookieAndSessionValid(req) {
  const ck = cookie.parse(req.headers.cookie ?? "");
  return (
    Object.keys(ck).length !== 0 && Store.get(ck.sessionid)?.uid !== undefined
  );
}

function redirect(res, path) {
  res.writeHead(302, {
    Location: path,
  });
  res.end();
}

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function setSessionIdAndRedirect(res, sid) {
  res.writeHead(302, {
    Location: "/dashboard",
    "Set-Cookie": `sessionid=${sid}; path=/`,
  });
  res.end();
}

function renderView(req, res, file, httpStatusCode, data, cache) {
  cache = cache ?? false;

  const viewPath = path.join(__dirname, "../views", file);
  const filehash = md5(readFileSync(viewPath));

  if (req.headers?.["if-none-match"] === filehash) {
    res.statusCode = 304;
    res.end();
    return;
  }


  if (existsSync(viewPath)) {
    ejs.renderFile(viewPath, data ?? {}, (err, data) => {
      if (err) {
        console.error(err);
      }

      let resHeaders = { "Content-type": MIME.html };

      if (cache) {
        resHeaders["Cache-Control"] = "max-age=31536000, no-cache";
        resHeaders["Etag"] = filehash;
      }

      res.writeHead(httpStatusCode ?? 200, resHeaders);
      res.write(data);
    });
  } else {
    renderView(req, res, "404.ejs", 404, {}, true);
  }
  res.end();
}

function generatePassword(length) {
  return crypto.randomBytes(length).toString("hex");
}

module.exports = {
  sendJsonErr,
  isCookieAndSessionValid,
  generatePassword,
  setSessionIdAndRedirect,
  redirect,
  md5,
  renderView,
  newID,
};

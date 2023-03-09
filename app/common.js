const {
  MIME,
} = require("./constants");

const crypto = require("crypto");
const { Store } = require("../models/MemoryStore");
const cookie = require("cookie");

function sendJsonErr(res, err) {
  res.writeHead(err.code, { "Content-type": MIME.json });
  res.write(JSON.stringify(err));
  res.end();
}

function isCookieAndSessionValid(req) {
  const ck = cookie.parse(req.headers.cookie ?? "");
  return Object.keys(ck).length !== 0 && Store.get(ck.sessionid)?.uid !== undefined;
}

function redirect(res, path) {
  res.writeHead(302, {
    "Location": path
  })
  res.end();
}

function md5(str) {
  return crypto
    .createHash("md5")
    .update(str)
    .digest("hex");
}

function setSessionIdAndRedirect(res, sid) {
  res.writeHead(302, {
    Location: "/dashboard",
    "Set-Cookie": `sessionid=${sid}; path=/`,
  });
  res.end();
}

function generatePassword(length) {
  return crypto.randomBytes(length).toString("hex")
}
module.exports = { 
  sendJsonErr, 
  isCookieAndSessionValid, 
  generatePassword, 
  setSessionIdAndRedirect, 
  redirect,
  md5,
};

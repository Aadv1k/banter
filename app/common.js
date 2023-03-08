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
  console.log(req.headers.cookie);
  const ck = cookie.parse(req.headers.cookie ?? "");
  return Object.keys(ck).length !== 0 && Store.get(ck.sessionid)?.uid !== undefined;
}

function redirect(res, path) {
  res.writeHead(302, {
    "Location": path
  })
  res.end();
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
};

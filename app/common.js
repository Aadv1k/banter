const {
  MIME,
  ERR
} = require("./constants");

const { Store } = require("../models/MemoryStore.js");


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

module.exports = { sendJsonErr, isCookieAndSessionValid};

const {
  MIME,
} = require("./constants");

const crypto = require("crypto");
const { Store } = require("../models/MemoryStore");
const cookie = require("cookie");
const _ = require("lodash");

function sendJsonErr(res, err) {
  res.writeHead(err.code, { "Content-type": MIME.json });
  res.write(JSON.stringify(err));
  res.end();
}

function generatePodcastFileName(userid, pdName, pdEpisodeName, pdEpisodeNumber) {
  let name = _.kebabCase(pdName),
    epName = _.kebabCase(pdEpisodeName);
  return `${userid}\$${name}\$ep-${pdEpisodeNumber}\$${epName}`;
}

function parsePodcastFileName(name) {
  const split = name.split('$');
  return {
    userid: split[0],
    pdName: _.lowerCase(split[1]),
    pdEpisodeNumber: split[2],
    epName: _.lowerCase(split[3])
  }
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
  parsePodcastFileName,
  generatePodcastFileName
};

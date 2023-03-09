const { Store } = require("../models/MemoryStore");
const cookie = require("cookie");

module.exports = (req, res) => {
  const ck = cookie.parse(req.headers.cookie ?? "");
  if (ck.sessionid) {
    Store.rm(ck.sessionid);
    res.writeHead(302, { Location: "/", "Set-Cookie": "sessionid=" });
  } else {
    res.writeHead(302, { Location: "/" });
  }
  res.end();
};

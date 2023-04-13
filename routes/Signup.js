const { Store } = require("../models/MemoryStore");
const { ERR } = require("../common/constants.js");
const { isCookieAndSessionValid, sendJsonErr, renderView } = require("../common/common.js");

const { UserModel, User } = require("../models/UserModel");
const USER_DB = new UserModel();
const formidable = require("formidable");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");

module.exports = async (req, res) => {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
      res.writeHead(302, { Location: "/dashboard" });
      return;
    }
    renderView(req, res, "signup.ejs", 200, {}, true);
  } else if (req.method !== "POST") {
    sendJsonErr(res, ERR.invalidMethod);
    return;
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, _) => {
    if (err) {
      sendJsonErr(res, ERR.internalErr);
      return;
    }

    let { email, password, name } = fields;

    if (![email, password, name].every((e) => e)) {
      sendJsonErr(res, ERR.badInput);
      return;
    }

    const uid = crypto.randomBytes(12);
    const sid = uuid();

    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

    const user = await USER_DB.getUser({ email: email });

    if (user) {
      sendJsonErr(res, ERR.userExists);
      return;
    }

    await USER_DB.pushUser(new User(uid, name, email, hashedPassword));

    Store.store(sid, { uid });

    res.writeHead(302, {
      Location: "/dashboard",
      "Set-Cookie": `sessionid=${sid}`
    });
  });
};

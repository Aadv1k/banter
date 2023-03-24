const { ERR } = require("../common/constants.js");

const {
  isCookieAndSessionValid,
  sendJsonErr,
  md5,
  redirect,
  renderView,
  newID
} = require("../common/common.js");

const { Store } = require("../models/MemoryStore");
const { UserModel } = require("../models/UserModel");
const formidable = require("formidable");

const USER_DB = new UserModel();

module.exports = async (req, res) => {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
      redirect(res, "/dashboard");
      return;
    }
    renderView(req, res, "login.ejs", 200, {}, true);
    return;
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

    let { email, password } = fields;

    if (![email, password].every((e) => e)) {
      sendJsonErr(res, ERR.badInput);
      return;
    }

    const sid = newID();
    const hashedPassword = md5(password);
    const dbUser = await USER_DB.getUser({ email: email });

    if (!dbUser) {
      sendJsonErr(res, ERR.userNotFound);
      return;
    } else if (dbUser.password != hashedPassword) {
      sendJsonErr(res, ERR.invalidPassword);
      return;
    }

    Store.store(sid, { uid: dbUser._id });

    res.writeHead(302, {
      Location: "/dashboard",
      "Set-Cookie": `sessionid=${sid}`
    });
    res.end();
  });
};

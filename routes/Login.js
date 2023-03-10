const { ERR } = require("../app/constants");

const {
  isCookieAndSessionValid,
  sendJsonErr,
  md5,
  redirect,
  renderView,
} = require("../app/common");

const {v4: uuid} = require("uuid");

const { Store } = require("../models/MemoryStore");
const { UserModel } = require("../models/UserModel");

const querystring = require("querystring");

const USER_DB = new UserModel();

module.exports = async (req, res) => {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
      redirect(res, "/dashboard");
      return;
    }
    renderView(req, res, "login.ejs", 200, {}, true);
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      const formData = querystring.parse(body);
      if (![formData.email, formData.password].every((e) => e)) {
        sendJsonErr(res, ERR.badInput);
        return;
      }
      const sid = uuid();
      const hashedPassword = md5(formData.password);
      const dbUser = await USER_DB.getUser({ email: formData.email });

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
        "Set-Cookie": `sessionid=${sid}`,
      });
      res.end();
    });
  }
};

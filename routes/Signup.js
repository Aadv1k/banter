const { Store } = require("../models/MemoryStore");
const { ERR, } = require("../app/constants");
const { isCookieAndSessionValid, sendJsonErr, renderView } = require("../app/common");

const { UserModel, User } = require("../models/UserModel");
const USER_DB = new UserModel();

const querystring = require("querystring");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");

module.exports = async (req, res) => {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
      res.writeHead(302, { Location: "/dashboard" });
      res.end();
      return;
    }
    renderView(res, "signup.ejs", 200);
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      const formData = querystring.parse(body);

      if (![formData.name, formData.email, formData.password].every((e) => e)) {
        sendJsonErr(res, ERR.badInput);
        return;
      }

      const uid = uuid();
      const sid = uuid();

      const hashedPassword = crypto
        .createHash("md5")
        .update(formData.password)
        .digest("hex");

      const user = await USER_DB.getUser({ email: formData.email });

      if (user) {
        sendJsonErr(res, ERR.userExists);
        return;
      }

      await USER_DB.pushUser(
        new User(uid, formData.name, formData.email, hashedPassword)
      );

      Store.store(sid, { uid });

      res.writeHead(302, {
        Location: "/dashboard",
        "Set-Cookie": `sessionid=${sid}`,
      });
      res.end();
    });
  }
}

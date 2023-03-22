const {
  isCookieAndSessionValid,
  sendJsonErr,
} = require("../app/common");

const { ERR, MIME} = require("../app/constants");
const { Store } = require("../models/MemoryStore.js");
const { UserModel } = require("../models/UserModel.js");
const USER_DB = new UserModel();
const cookie = require("cookie");

module.exports = async (req, res) => {
  await USER_DB.init();

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  const { uid }  = Store.get(cookie.parse(req.headers.cookie).sessionid);
  const user = await USER_DB.getUser({_id: uid});

  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  res.writeHead(200, {"Content-type": MIME.json})

  const jsonResponse = {
    id: user._id, 
    name: user.name,
    profileImage: user.profileImage,
  }
  res.write(JSON.stringify(jsonResponse))
  res.end();
}

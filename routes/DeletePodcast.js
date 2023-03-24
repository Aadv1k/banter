const { ERR } = require("../common/constants.js");
const { sendJsonErr, isCookieAndSessionValid } = require("../common/common.js");

const querystring = require("querystring");
const cookie = require("cookie");

const { UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore.js");
const USER_DB = new UserModel();

module.exports = async (req, res) => {
  await USER_DB.init();
  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;

  if (req.method !== "DELETE") {
    sendJsonErr(res, ERR.invalidMethod);
    return;
  }

  const { podcastID } = querystring.parse(req.url.split("?").pop());

  if (!podcastID) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  console.log(podcastID);

  try {
    const res = await USER_DB.deletePodcastForUser({ _id: userid }, podcastID);
    if (res === null) {
      sendJsonErr(res, ERR.internalErr);
      return;
    }
  } catch (err) {
    console.error(err);
    sendJsonErr(res, ERR.internalErr);
    return;
  }

  res.writeHead(200, {
    "Content-type": "application/json"
  });
  res.write(
    JSON.stringify({
      message: "podcast deleted successfully",
      code: 200
    })
  );
  res.end();
};

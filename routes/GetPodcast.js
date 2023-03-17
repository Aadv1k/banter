const { ERR, MIME } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid} = require("../app/common");
const cookie = require("cookie");
const { UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore.js");
const USER_DB = new UserModel();
const querystring = require("querystring");


module.exports = async (req, res) => {
  await USER_DB.init();

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  const { podcastID } = querystring.parse(req.url.split('?').pop());
  const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  const podcast = await USER_DB.getPodcastForUser({_id: userid}, podcastID);

  res.writeHead(200, {
    "Content-type": MIME.json
  })

  if (podcast) {
    res.write(JSON.stringify(podcast));
  } else {
    res.write(JSON.stringify({}));
  }
  res.end();
}

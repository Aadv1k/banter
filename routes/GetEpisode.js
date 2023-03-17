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

  const {episodeID, podcastID} = querystring.parse(req.url.split('?').pop());

  if (!podcastID) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  const episode = await USER_DB.getEpisodeForUser({_id: userid}, podcastID, episodeID);

  if (episode) {
    res.writeHead(200, {
      "Content-type": MIME.json
    })
    res.write(JSON.stringify(episode ?? {}));
    res.end();
    return;
  }
}

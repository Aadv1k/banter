const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid } = require("../app/common");

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

  const { episodeID, podcastID } = querystring.parse(req.url.split('?').pop());

  if (!episodeID || !podcastID) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  try {
    const res = await USER_DB.deleteEpisodeForUser({_id: userid}, podcastID, episodeID) 
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
    "Content-type": "application/json",
  })
  res.write(JSON.stringify({
    message: "episode deleted successfully",
    code: 200,
  }));
  res.end();
};

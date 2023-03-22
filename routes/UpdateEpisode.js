const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid, newID} = require("../app/common");
const cookie = require("cookie");
const crypto = require("crypto");

const { UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore.js");
const USER_DB = new UserModel();
const formidable = require("formidable");


module.exports = async (req, res) => {
  await USER_DB.init();
  
  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

 const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;

  if (req.method !== "PUT") {
    sendJsonErr(res, ERR.invalidMethod);
    return;
  }

  const form = formidable({ multiples: false, });

  const {fields, files} = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });

  if (![fields.podcastID, fields.episodeID].every((e) => e)) {
    return;
  }

  const podcasts = await USER_DB.getPodcastsForUser({_id: userid});
  if (!podcasts?.[fields.podcastID]) {
    sendJsonErr(res, ERR.invalidPodcastID) 
    return;
  }

  if (!podcasts[fields.podcastID].episodes.find(e => e.id == fields.episodeID)) {
    // TODO: change this to episode id
    sendJsonErr(res, ERR.invalidEpisodeID)
    return;
  }

  const user = await USER_DB.getUser({_id: userid});
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  const updatedEpisode = {
    ...fields,
  }

  if (await USER_DB.updateEpisodeForUser({_id: userid}, fields.podcastID, {id: fields.episodeID}, updatedEpisode) === null) {
    sendJsonErr(res, ERR.internalErr);
    return;
  }

  res.writeHead(200, {
    "Content-type": "application/json",
  })
  res.write(JSON.stringify({
    message: "episode updated successfully",
    code: 200,
    data: {
      ...updatedEpisode
    }
  }));
  res.end();
};

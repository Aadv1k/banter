const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid, newID} = require("../app/common");
const cookie = require("cookie");

const { UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore.js");
const USER_DB = new UserModel();
const fs = require("fs");
const formidable = require("formidable");


module.exports = async (req, res) => {
  const BUCKET = new BucketStore();
  await USER_DB.init();
  /*
  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }
  */

  //const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  const userid = "6411ebab105bcd05b8790c57";
  if (req.method !== "POST") {
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


  if (![ files.audio, fields.title, fields.number, fields.explicit, fields.podcastID, ].every((e) => e)) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const podcasts = await USER_DB.getPodcastsForUser({_id: userid});
  if (!podcasts?.[fields.podcastID]) {
    sendJsonErr(res, ERR.invalidPodcastID) 
    return;
  }

  const audioFile = files["audio"];
  const audioFileType = audioFile.mimetype;
  if (audioFileType != "audio/mpeg") {
    sendJsonErr(res, ERR.invalidAudioFileFormat);
    return;
  }

  const audioSizeInMB = parseInt(audioFile.size / 8e5);
  if (audioSizeInMB > MAX_EPISODE_SIZE_IN_MB) {
    sendJsonErr(res, ERR.exceedsAudioSizeLimit);
    return;
  }

  const { title, number, explicit, podcastID } = fields;
  const epId = newID();

  const user = await USER_DB.getUser({_id: userid});
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  const userPodcast = user?.podcasts?.[podcastID];

  if (!userPodcast) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  let permalink;

  try {
    const { path } = await BUCKET.pushFile(audioFile.filepath);
    permalink = path;
  } catch (err) {
    console.error(err)
    sendJsonErr(res, ERR.internalErr)
    return;
  }

  const episode = {
    id: epId,
    title: title,
    number: number,
    permalink: permalink,
    explicit: explicit === "true",
  }

  if (!await USER_DB.insertEpisodeForUser({_id: userid}, podcastID, episode)) {
    sendJsonErr(res, ERR.internalErr);
    return;
  }

  res.writeHead(200, {
    "Content-type": "application/json",
  })
  res.write(JSON.stringify(user));
  res.end();
};

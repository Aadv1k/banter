const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../common/constants.js");
const { sendJsonErr, isCookieAndSessionValid } = require("../common/common.js");
const cookie = require("cookie");
const crypto = require("crypto");

const { UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore.js");
const USER_DB = new UserModel();
const formidable = require("formidable");

module.exports = async (req, res) => {
  const BUCKET = new BucketStore();
  await USER_DB.init();

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  if (req.method !== "POST") {
    sendJsonErr(res, ERR.invalidMethod);
    return;
  }

  const form = formidable({ multiples: false });

  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });

  if (
    ![
      files.audio,
      fields.title,
      fields.number,
      fields.explicit,
      fields.podcastID,
      fields.description
    ].every((e) => e)
  ) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const podcasts = await USER_DB.getPodcastsForUser({ _id: userid });
  if (!podcasts?.[fields.podcastID]) {
    sendJsonErr(res, ERR.invalidPodcastID);
    return;
  }

  if (podcasts[fields.podcastID]?.episodes?.length >= 50) {
    sendJsonErr(res, ERR.episodeLimitExceeded);
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

  const { title, number, explicit, podcastID, description } = fields;

  const user = await USER_DB.getUser({ _id: userid });
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  const userPodcast = user?.podcasts?.[podcastID];

  if (!userPodcast) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  const { path: permalink } = await BUCKET.pushFile(audioFile.filepath).catch((err) => {
    console.error(err);
    sendJsonErr(res, ERR.internalErr);
    return;
  });

  const episode = {
    id: crypto.randomBytes(8).toString("hex"),
    title,
    description,
    number,
    permalink,
    createdAt: new Date().toISOString(),
    explicit: explicit === "true"
  };

  try {
    await USER_DB.insertEpisodeForUser({ _id: userid }, podcastID, episode);
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
      message: "new episode created successfully",
      code: 200,
      data: {
        id: episode.id,
        title: episode.title,
        permalink: episode.permalink
      }
    })
  );
  res.end();
};

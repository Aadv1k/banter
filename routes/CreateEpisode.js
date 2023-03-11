const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid } = require("../app/common");
const cookie = require("cookie");

const {v4: uuid} = require("uuid");

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

  const uncompressedAudioStream = fs.createReadStream(audioFile.filepath);
  //const compressedAudioStream = new PassThrough();

  const { title, number, explicit, podcastID } = fields;

    const epId = uuid();
    const audioFileName = `${epId}.mp3`;

    //const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
    const userid = "6f4286ef-8041-455b-95b4-8dfb3d5f4754";
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
      await BUCKET.pushBinary(uncompressedAudioStream, audioFileName);
      permalink = await BUCKET.getBinaryPermalink(audioFileName);
    } catch (err) {
      console.error(err)
      sendJsonErr(res, ERR.internalErr)
      return;
    }


      console.log("not here")

    const pdEpisodeEntry = {
      epId,
      epTitle: title,
      epNumber: number,
      epPermalink: permalink,
      epExplicit: explicit === "true",
    };

    let updateBlob = { podcasts: {
        ...user.podcasts
    }}

    updateBlob.podcasts[podcastID].episodes.push(pdEpisodeEntry);
    await USER_DB.updateUser({_id: userid}, { $set: updateBlob })

    res.writeHead(200, {
      "Content-type": "application/json",
    })
    res.write(JSON.stringify(user));
    res.end();
};

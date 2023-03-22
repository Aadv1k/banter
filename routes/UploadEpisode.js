const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_EPISODE_SIZE_IN_MB } = require("../app/constants");

const { sendJsonErr } = require("../app/common");
const formidable = require("formidable");
const { Readable } = require("stream");
const cookie = require("cookie");

const { UserModel } = require("../models/UserModel.js");
const USER_DB = new UserModel();

exports.default = async (req, res) => {
  const BUCKET = new BucketStore();
  await USER_DB.init();

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  if (req.method !== "POST") {
    sendJsonErr(res, ERR.invalidMethod);
    return;
  }

  const audioForm = formidable({ multiples: false });
  audioForm.parse(req, async (_, fields, files) => {
    if (
      ![
        files.epAudio,
        fields.epName,
        fields.epNumber,
        fields.epExplicit,
        files.epCover,
      ].every((e) => e)
    ) {
      sendJsonErr(res, ERR.badInput);
      return;
    }

    const audioExt = files.epAudio.originalFileName.split(".").pop();
    const imageExt = files.epCover.originalFileName.split(".").pop();

    if (
      !["aac"].includes(audioExt) ||
      ["jpeg", "png", "jpg"].incudes(imageExt)
    ) {
      sendJsonErr(res, ERR.invalidAudioFileFormat);
      return;
    }

    const audioSizeInMB = parseInt(files.epAudio.size / 8e6);
    // TODO: impl this as well
    // const imageSizeInMB = parseInt(files.epImage.size / 8e+6);

    if (audioSizeInMB > MAX_EPISODE_SIZE_IN_MB) {
      sendJsonErr(res, ERR.exceedsAudioSizeLimit);
      return;
    }

    const readStream = new Readable();
    readStream.push(files.epAudio.data);
    readStream.push(null);

    const epId = uuid();
    const audioFileName = `${epId}.aac`;

    await BUCKET.pushBinary(readStream, audioFileName);
    const permalink = await BUCKET.getBinaryPermalink(audioFileName);

    const pdEpisodeEntry = {
      epId,
      epTitle: fields.name,
      epNumber: fields.number,
      epPermalink: permalink,
      epExplicit: fields.epExplicit === "true" ? true : false,
    };

    const userid = Store.get(cookie.parse(req.headers.cookie).sessionid);
    const user = await USER_DB.getUser({ _id: userid });
    if (!user) {
      sendJsonErr(res, ERR.userNotFound);
      return;
    }
  });
};

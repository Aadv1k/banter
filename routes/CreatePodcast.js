const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_IMAGE_SIZE_IN_MB } = require("../common/constants.js");
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
      files.cover,
      fields.title,
      fields.explicit,
      fields.description,
      fields.category,
      fields.language
    ].every((e) => e)
  ) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const coverFile = files["cover"];
  const imageFileType = coverFile.mimetype;
  if (!["image/jpeg", "image/png"].includes(imageFileType)) {
    sendJsonErr(res, ERR.invalidAudioFileFormat);
    return;
  }

  const imageFileSizeInMB = parseInt(coverFile.size / 8e5);
  if (imageFileSizeInMB > MAX_IMAGE_SIZE_IN_MB) {
    sendJsonErr(res, ERR.exceedsImageSizeLimit);
    return;
  }

  const { title, explicit, description, category, language } = fields;
  const user = await USER_DB.getUser({ _id: userid });
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  let permalink;
  try {
    const { path } = await BUCKET.pushFile(coverFile.filepath);
    permalink = path;
  } catch (err) {
    console.error(err);
    sendJsonErr(res, ERR.internalErr);
    return;
  }

  const podcast = {
    id: crypto.randomBytes(8).toString("hex"),
    language,
    title,
    category,
    description,
    cover: permalink,
    explicit: explicit === "true"
  };

  try {
    await USER_DB.insertPodcastForUser({ _id: userid }, podcast);
    res.writeHead(200, {
      "Content-type": "application/json"
    });
    res.write(
      JSON.stringify({
        message: "new podcast created successfully",
        code: 200,
        data: {
          id: podcast.id,
          title: podcast.title,
          cover: podcast.cover
        }
      })
    );
    res.end();
  } catch (err) {
    console.error(err);
    sendJsonErr(res, ERR.internalErr);
  }
};

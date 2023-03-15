const { BucketStore } = require("../models/BucketStore.js");
const { ERR, MAX_IMAGE_SIZE_IN_MB} = require("../app/constants");
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

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }
  
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


  if (![ files.cover, fields.title, fields.explicit, fields.description, fields.category].every((e) => e)) {
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

  const { title, explicit, description, category } = fields;
  const pID = uuid();

  const userid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  const user = await USER_DB.getUser({_id: userid});
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  let permalink;

  try {
    const { path } = await BUCKET.pushFile(coverFile.filepath);
    permalink = path;
  } catch (err) {
    console.error(err)
    sendJsonErr(res, ERR.internalErr)
    return;
  }

  const podcast = {
    id: pID,
    title,
    category,
    description,
    cover: permalink,
    explicit: explicit === "true",
  }

  try {
    await USER_DB.insertPodcastForUser({_id: userid}, podcast);
    res.writeHead(200, {
      "Content-type": "application/json",
    })
    res.write(JSON.stringify({
      message: "successfully created a new podcast for the user",
      code: 200
    }));
    res.end();
  } catch {
    sendJsonErr(res, ERR.internalErr);
  }
};

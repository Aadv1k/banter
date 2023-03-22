const { ERR } = require("../app/constants");
const { sendJsonErr, isCookieAndSessionValid} = require("../app/common");
const cookie = require("cookie");

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


  // TODO: Implementation for updating binary files  
  const {fields, _} = await new Promise((resolve, reject) => {
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

  const user = await USER_DB.getUser({_id: userid});
  if (!user) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  const updatedPodcast = {
    ...fields,
  }

  if (await USER_DB.updatePodcastForUser({_id: userid}, fields.podcastID, updatedPodcast) === null) {
    sendJsonErr(res, ERR.internalErr);
    return;
  }

  res.writeHead(200, {
    "Content-type": "application/json",
  })
  res.write(JSON.stringify({
    message: "podcast updated successfully",
    code: 200,
    data: {
      ...updatedPodcast
    }
  }));
  res.end();
};

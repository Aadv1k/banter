const { ERR, MIME } = require("../common/constants.js");
const { sendJsonErr } = require("../common/common.js");
const { UserModel } = require("../models/UserModel.js");
const RSS = require("rss");
const USER_DB = new UserModel();
const querystring = require("querystring");

module.exports = async (req, res) => {
  await USER_DB.init();
  const { podcastID, userID } = querystring.parse(req.url.split("?").pop());

  if (!userID || !podcastID) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const podcasts = await USER_DB.getPodcastsForUser({ _id: userID }).catch((_) => {
    return null;
  });

  if (!podcasts) {
    sendJsonErr(res, ERR.userNotFound);
    return;
  }

  let targetPodcast = podcasts[podcastID];
  if (!targetPodcast) {
    sendJsonErr(res, ERR.invalidPodcastID);
    return;
  }

  let rssFeed = new RSS({
    title: targetPodcast.title,
    description: targetPodcast.description,
    feed_url: `https://${req.headers.host}/rss?uid=${userID}&pid=${podcastID}}`,
    image_url: targetPodcast.cover,
    //author: "",
    //site_url: "",
    language: targetPodcast.language
  });

  if (targetPodcast.episodes) {
    for (let episode of targetPodcast.episodes) {
      rssFeed.item({
        id: episode.id,
        title: episode.title,
        description: episode.description,
        url: episode.audio,
        date_published: episode.createdAt
      });
    }
  }

  const xmlResponse = rssFeed.xml({ indent: true });
  res.writeHead(200, {
    "Content-type": MIME.xml
  });
  res.write(xmlResponse);
  res.end();
};

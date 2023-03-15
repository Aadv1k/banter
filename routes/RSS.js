const { ERR, MIME} = require("../app/constants");
const { sendJsonErr } = require("../app/common");
const { UserModel } = require("../models/UserModel.js");
const RSS  = require("rss");
const USER_DB = new UserModel();
const querystring = require("querystring");

module.exports = async (req, res) => {
  await USER_DB.init();
  const { pid, uid } = querystring.parse(req.url.split('?').pop());

  console.log(querystring.parse(req.url))
  if (!uid || !pid) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const podcasts = await USER_DB.getPodcastsForUser({_id: uid});
  if (!podcasts) {
    sendJsonErr(res, ERR.userNotFound)
    return
  }

  let targetPodcast = podcasts[pid];
  if (!targetPodcast) {
    sendJsonErr(res, ERR.invalidPodcastID);
    return;
  }

  let rssFeed = new RSS({
    title: targetPodcast.title,
    description: targetPodcast.description,
    image_url: targetPodcast.cover,
  })

  if (targetPodcast.episodes) {
    
    for (let episode of targetPodcast.episodes) {
      rssFeed.item({
        title: episode.title,
        description: episode.description,
        url: episode.audio,
        date: new Date(episode.date),
      })
    }

  }

  const xmlResponse = rssFeed.xml({indent: true}) 
  res.writeHead(200, {
    "Content-type": MIME.xml,
  })
  res.write(xmlResponse)
  res.end();
};

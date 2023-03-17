const { MongoClient } = require("mongodb");
const oid = require('mongodb').ObjectId;

const { ATLAS_PWD } = require("../app/constants.js");
const ATLAS_URL = `mongodb+srv://user-1:${ATLAS_PWD}@banter-dev.acxedwo.mongodb.net`;

class User {
  constructor(id, name, email, password, profileImage) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.profileImage = profileImage ?? "";
  }
}

class UserModel {
  constructor() {
    this.client = new MongoClient(ATLAS_URL);
    this.db = null;
    this.users = null;
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db("UserDB");
    this.users = this.db.collection("users");
  }

  parseQuery(q) {
    q["_id"] = new oid(q["_id"]);
    return q;
  }

  async pushUser(user) {
    await this.users.insertOne({
      _id: new oid(user._id),
      name: user.name,
      email: user.email,
      password: user.password,
      profileImage: user.profileImage,
    });
  }

  async getUser(query) {
    query = this.parseQuery(query);
    const user = await this.users.findOne(query);
    return user ?? null;
  }

  async deleteEpisodeForUser(userQuery, podcastID, episodeID) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    if (!user?.podcasts?.[podcastID]) {
      return null;
    }

    const episodes = user.podcasts?.[podcastID]?.episodes;

    if (!episodes || episodes.length === 0) {
      return null;
    }

    const target = episodes.findIndex(e => { e.id === episodeID });
    episodes.splice(target, 1);

    let updateBlob = {};
    updateBlob[podcastID] = episodes

    if (!await this.users.updateOne(userQuery, { $set: {
      podcasts: updateBlob
    }})) {
      return null;
    }
  }

  async getPodcastsForUser(userQuery) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    if (!user) {
      return null;
    }
    return user?.podcasts ?? {};
  }

  async insertEpisodeForUser(userQuery, podcastID, episode) {
    userQuery = this.parseQuery(userQuery)

    const user = await this.users.findOne(userQuery);
    if (!user?.podcasts?.[podcastID]) {
      return null;
    }

    const podcast = user.podcasts?.[podcastID];
    const episodes = podcast?.episodes ?? [];
    episodes.push(episode);
    podcast.episodes = episodes;

    const updateQuery = user.podcasts;
    updateQuery[podcastID] = podcast;

    try {
      this.users.updateOne(userQuery, {
        $set: { podcasts: updateQuery, }})
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async insertPodcastForUser(userQuery, podcastObj) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    const podcasts = user?.podcasts ?? {};

    podcasts[podcastObj.id] = {
      cover: podcastObj.cover,
      language: podcastObj.language,
      title: podcastObj.title,
      category: podcastObj.category,
      description: podcastObj.description,
      explicit: podcastObj.explicit,
    }

    try {
      await this.users.updateOne(userQuery, {
        $set: {
          podcasts: podcasts
        }
      })
    } catch (err) {
      return null;
    }
  }

  async userExists(query) {
    query = this.parseQuery(query);
    if (await this.users.findOne(query)) {
      return true;
    }
    return false;
  }

  async close() {
    await this.client.close();
  }
}

module.exports = { User, UserModel };

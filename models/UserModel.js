const { MongoClient } = require("mongodb");

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

  async pushUser(user) {
    await this.users.insertOne({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      profileImage: user.profileImage,
    });
  }

  async getUser(query) {
    const user = await this.users.findOne(query);
    return user ?? null;
  }

  async deleteEpisodeForUser(userQuery, podcastID, episodeID) {
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
    const user = await this.users.findOne(userQuery);
    if (!user) {
      return null;
    }
    return user?.podcasts ?? {};
  }

  async insertEpisodeForUser(userQuery, podcastID, episode) {
    const user = await this.users.findOne(userQuery);
    if (!user?.podcasts?.[podcastID]) {
      return null;
    }

    const episodes = user.podcasts?.[podcastID].episodes ?? [];
    episodes.push(episode);

    try {
      this.users.updateUser(userQuery, {
        $set: {
          episodes,
        }
      })
    } catch {
      return null;
    }
  }

  async insertPodcastForUser(userQuery, podcastObj) {
    const user = await this.users.findOne(userQuery);
    const podcasts = user?.podcasts ?? {};
    podcasts[podcastObj.id] = {
      cover: podcastObj.cover,
      title: podcastObj.title,
      category: podcastObj.category,
      description: podcastObj.description,
      explicit: podcastObj.explicit,
      crosspost: podcastObj.crosspost,
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
    if (await this.users.findOne(query)) {
      return true;
    }
    return false;
  }

  async updateUser(source, target) {
    await this.users.updateOne(source, target);
  }

  async close() {
    await this.client.close();
  }
}

module.exports = { User, UserModel };

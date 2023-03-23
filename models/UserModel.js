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
    if (q["_id"]) {
      q["_id"] = new oid(q["_id"]);
    }
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

  async getEpisodeForUser(query, pid, eid = undefined) {
    query = this.parseQuery(query);
    const user = await this.users.findOne(query);

    if (!eid) {
      return user?.podcasts?.[pid]?.episodes ?? null
    } 
    return user?.podcasts?.[pid]?.episodes.find(e => e.id === eid) ?? null
  }

  async getPodcastForUser(query, id = undefined) {
    query = this.parseQuery(query);
    const user = await this.users.findOne(query);

    if (id) {
      return user?.podcasts?.[id] ?? null
    } 
    return user?.podcasts ?? null
  }

  async deletePodcastForUser(userQuery, podcastID) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);

    if (!user) {
      return null;
    }

    let updateBlob = {};
    updateBlob[`podcasts.${podcastID}`] = "";

    try {
      this.users.updateOne(userQuery, {
        $unset: { ...updateBlob }
      })
    } catch (_) {
      return null;
    }
  }

  async deleteEpisodeForUser(userQuery, podcastID, episodeID) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    if (!user?.podcasts?.[podcastID]) {
      return null;
    }

    let updateBlob = {};
    updateBlob[`podcasts.${podcastID}.episodes`] = {id: episodeID};

    try {
      await this.users.updateOne(
        userQuery, 
        { 
          $pull: { ...updateBlob }
        }
      )
    } catch(err) {
      console.error(err)
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


  async updatePodcastForUser(userQuery, podcastID, newPodcast) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    const podcast = user?.podcasts?.[podcastID];

    if (!podcast) {
      return null;
    }

    const updateQuery = `podcasts.${podcastID}`; 
    for (let field of Object.keys(newPodcast)) {
      updateBlob[`${updateQuery}.${field}`] = newPodcast[field];
    }

    await this.users.updateOne(userQuery, {
      $set: {
        ...updateBlob
      }
    }).catch(_ => {
      return null;
    })
  }

  async updateEpisodeForUser(userQuery, podcastID, oldEpisode, newEpisode) {
    userQuery = this.parseQuery(userQuery)
    const user = await this.users.findOne(userQuery);
    const episodes = user?.podcasts?.[podcastID]?.episodes;

    if (!episodes) {
      return null;
    }

    const episodeIdx = episodes.findIndex(e => e.id === oldEpisode.id);
    if (episodeIdx === null) {
      return null;
    }

    const updateQuery = `podcasts.${podcastID}.episodes.${episodeIdx}`; 
    const updateBlob = {};
    for (let field of Object.keys(newEpisode)) {
      updateBlob[`${updateQuery}.${field}`] = newEpisode[field];
    }

    await this.users.updateOne(userQuery, {
      $set: {
        ...updateBlob
      }
    }).catch(_ => {
      return null;
    })
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

const { MongoClient } = require("mongodb");

const { ATLAS_PWD } = require("../app/constants.js");
const ATLAS_URL = `mongodb+srv://user-1:${ATLAS_PWD}@banter-dev.acxedwo.mongodb.net`;
const { v4: uuid} = require("uuid");

class User {
  constructor(id, name, email, password) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}

class UserModel {
  constructor() {
    this.client = new MongoClient(ATLAS_URL);
    this.db = null;
    this.users = null;
    this.sessionIDs 
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
    });
  }

  async pushSessionID(sessionID, userID) {
    await this.sessions.insertOne({
      sessionID,
      userID,
    })
  }

  async getUserFromSessionID(sessionID) {
    const session = await this.sessions.findOne({
      sessionID,
    })

    if (!session) {
      return null;
    }

    const user = await this.users.findOne({
      _id: session.userID,
    })

    return user ?? null;
  }

  async userExists(user) {
    const userFound = await this.users.findOne({
      email: user.email
    })
    console.log(userFound === null);
    if (userFound === null) return false;
    return true
  }

  async close() {
    await this.client.close();
  }
}

module.exports = { User, UserModel };

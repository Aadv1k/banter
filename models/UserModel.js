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
    this.sessions = null;
  }

  async init() {
    await this.client.connect();
    this.db = this.client.db("UserDB");
    this.users = this.db.collection("users");
    this.sessions = this.db.collection("sessions");
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

  async getSessionIDFromUser(user) {
    const foundUser = await this.users.findOne({ email: user.email, password: user.password })
    if (!foundUser) return null;
    const userByID = await this.sessions.findOne({ userID: foundUser._id })
    if (!userByID) return null;

    return userByID.sessionID;
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
   if (await this.users.findOne({ email: user.email, password: user.password})) {
     return true;
   }
    return false;
  }

  async close() {
    await this.client.close();
  }
}

module.exports = { User, UserModel };

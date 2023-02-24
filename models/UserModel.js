const { MongoClient } = require("mongodb");

const { ATLAS_PWD } = require("../app/constants.js");
const ATLAS_URL = `mongodb+srv://user-1:${ATLAS_PWD}@banter-dev.acxedwo.mongodb.net`;

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


  async getUser(query) {
    return await this.users.findOne(query) ?? null;
  }

  async userExists(query) {
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

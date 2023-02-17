const { MongoClient } = require("mongodb");

const { ATLAS_PWD } = require("../app/constants.js");
const ATLAS_URL = `mongodb+srv://user-1:${ATLAS_PWD}@banter-dev.acxedwo.mongodb.net`;

class User {
  constructor(fname, lname, email, password) {
    this.fname = fname;
    this.lname = lname;
    this.email = email;
    this.password = password;
  }
}

class UserModel {
  constructor() {
    this.db = null;
    this.client = null;
  }

  async init() {
    this.client = new MongoClient(ATLAS_URL);
    this.db = await client.db("UserDB");
  }

  async pushUser(user) {
    await this.db.insertOne({
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      password: user.password,
    });
  }

  async close() {
    await this.client.close();
  }
}

module.exports = { User, UserModel };

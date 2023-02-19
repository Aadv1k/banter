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
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      password: user.password,
    });
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

const { MongoClient } = require("mongodb");
const fetch = require("node-fetch-commonjs");

const { ATLAS_PWD, DBX_ACCESS_TOKEN} = require("../app/constants.js");
const ATLAS_URL = `mongodb+srv://user-1:${ATLAS_PWD}@banter-dev.acxedwo.mongodb.net`;
const {Dropbox} = require("dropbox");

const fs = require("fs");

class Audio {
  constructor(binaryData, fileName) {
    this.binaryData = binaryData;
    this.fileName = fileName;
  }
}

class AudioModel {
  constructor() {
    this.db = new Dropbox({ accessToken: DBX_ACCESS_TOKEN });
  }

  async pushAudio(Audio) {
    const { result } = await this.db.filesUpload({ path: '/' + Audio.fileName, contents: Audio.binaryData });
    if (!result ) return null; 
    return {id: result.id, path: result.path_display};
  }

  async getPermaLink(Audio) {
    const dbxUrl = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
    const res = await fetch(dbxUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DBX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: '/' + Audio.fileName,
        "settings": {
          "access": "viewer",
          "allow_download": true,
          "audience": "public",
          "requested_visibility": "public"
        }
      })
    })

    const data = await res.json();
    if (!data) return null;

    if (data.error['.tag'] === 'shared_link_already_exists') {
      const res = await fetch("https://api.dropboxapi.com/2/sharing/list_shared_links", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DBX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: '/' + Audio.fileName,
        })
      })
      const data = await res.json();
      return data.url;
    }
    return data.url;
  }
}

module.exports = {Audio, AudioModel};

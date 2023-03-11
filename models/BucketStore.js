const { DBX_ACCESS_TOKEN } = require("../app/constants.js");
const { Dropbox } = require("dropbox");

class BucketStore {
  constructor() {
    this.bucket = new Dropbox({ accessToken: DBX_ACCESS_TOKEN });
  }

  async pushBinary(data, name) {
    const { result } = await this.bucket.filesUpload({
      path: `/${name}`,
      contents: data,
    });
    if (!result) return null;
    return { id: result.id, path: result.path_display };
  }

  async getBinaryPermalink(name) {
    const dbxUrl =
      "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings";
    const res = await fetch(dbxUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DBX_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: `/${name}`,
        settings: {
          access: "viewer",
          allow_download: true,
          audience: "public",
          requested_visibility: "public",
        },
      }),
    });

    const data = await res.json();
    if (!data) return null;

    if (data.error?.[".tag"] === "shared_link_already_exists") {
      const res = await fetch(
        "https://api.dropboxapi.com/2/sharing/list_shared_links",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DBX_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "/" + Audio.fileName,
          }),
        }
      );
      const data = await res.json();
      return data.url;
    }
    return data.url;
  }
}

module.exports = { BucketStore };

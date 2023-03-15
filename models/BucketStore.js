const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME} = require("../app/constants")

class BucketStore {
  constructor() {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET
    });

    this.permalink;
    this.bucket = cloudinary;
  }


  async pushFile(filepath) {
    let result = await this.bucket.uploader
      .upload(filepath) 
      .catch(error => {
        console.error(error);
        return null;
    });

    this.permalink = result.url;
    return { id: result.asset_id, path: result.url };
  }
}

module.exports = { BucketStore };

const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME} = require("../app/constants")
const { statSync } = require("fs");

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
    const { size: fileSize } = statSync(filepath);
    let fileSizeInMB = fileSize / 8e4;
    let result;

    console.log(fileSizeInMB);

    try {
      if (fileSizeInMB > 100) {
        result = await this.bucket.uploader
          .upload_large(filepath)
        console.log(result);
      } else {
        result = await this.bucket.uploader
          .upload(filepath) 
      }
    } catch (err) {
      console.error(err);
      return null
    } 

    this.permalink = result.url;
    return { id: result.asset_id, path: result.url };
  }
}

module.exports = { BucketStore };

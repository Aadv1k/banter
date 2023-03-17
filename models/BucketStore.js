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

    const response = new Promise((resolve, reject) => {
      this.bucket.uploader[fileSizeInMB > 100 ? "upload_large": "upload"](
      filepath, 
      { resource_type: 'auto' }, 
      (err, result) => { 
        if (err) reject(err) 
        resolve(result);
      }
    )});

    try {
      const output = await response
      return {path: output.url};
    } catch (err) {
      return null;
    }
}}

module.exports = { BucketStore };

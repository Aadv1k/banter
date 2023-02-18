require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MODE: process.env.NODE_ENV || "development",
  ATLAS_PWD: process.env.ATLAS_PWD,

  MS_CLIENT_ID: process.env.MS_CLIENT_ID,
  MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,  
  MS_REDIRECT: process.env.MS_REDIRECT,

  MIME: {
    json: "application/json",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    png: "image/png",
    ico: "image/x-icon"
  },

  ERR: {
    badInput: {
      error: 'bad-input',
      message: 'the provided input was invalid',
      code: 400
    }
  }
};

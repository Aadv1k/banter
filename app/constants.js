require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  MODE: process.env.NODE_ENV || "development",
  ATLAS_PWD: process.env.ATLAS_PWD,

  MAX_EPISODE_SIZE_IN_MB: 100,

  MS_CLIENT_ID: process.env.MS_CLIENT_ID,
  MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
  MS_REDIRECT: process.env.MS_REDIRECT,

  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT: process.env.SPOTIFY_REDIRECT,

  DBX_ACCESS_TOKEN: process.env.DBX_ACCESS_TOKEN,

  MIME: {
    json: "application/json",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    png: "image/png",
    ico: "image/x-icon",
  },

  ERR: {
    badInput: {
      error: "bad-input",
      message: "the provided input was invalid",
      code: 400,
    },

    invalidMethod: {
      error: "invalid-method",
      message: "method invalid for requested resource",
      code: 405,
    },

    unableToFindUser: {
      error: "unable-to-find-user",
      message: "was unable to find the provided sessionID or user",
      code: 400,
    },

    unauthorized: {
      error: "unauthorized",
      message: "you don't have the credentials to access this resource",
      code: 401,
    },

    userExists: {
      error: "user-exists",
      message: "the user is already registered",
      code: 400,
    },

    userNotFound: {
      error: "user-not-found",
      message: "the given user is not registered",
      code: 404,
    },

    internalErr: {
      error: "internal-error",
      message: "something went wrong on the server",
      code: 500,
    },

    invalidAudioFileFormat: {
      error: "invalid-audio-file-format",
      message:
        "the provided file format for episode was invalid; only AAC is accepted",
      code: 400,
    },

    exceedsAudioSizeLimit: {
      error: "exceeds-audio-size-limit",
      message:
        "the provided data exeeds the audio size limit of a 100 Megabytes",
      code: 400,
    },

    invalidPassword: {
      error: "invalid-password",
      message: "the password given for the user is invalid",
      code: 401,
    },
  },
};

const {
  MIME,
  ERR,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT,
} = require("../app/constants");

const { Store } = require("../models/MemoryStore");
const { User, UserModel } = require("../models/UserModel");
const {
  sendJsonErr,
  generatePassword,
  setSessionIdAndRedirect,
  redirect,
  isCookieAndSessionValid,
} = require("../app/common");

const crypto = require("crypto");
const fetch = require("node-fetch-commonjs");
const cookie = require("cookie");
const { v4: uuid } = require("uuid");
const querystring = require("querystring");

const USER_DB = new UserModel();

async function handleRouteAuthSpotify(req, res) {
  const scope = "user-read-private user-read-email";

  const spotifyQuery = querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: SPOTIFY_REDIRECT,
    scope: scope,
  });

  const spotifyUrl = `https://accounts.spotify.com/authorize?${spotifyQuery}`;
  redirect(res, spotifyUrl);
}

async function handleRouteAuthSpotifyCallback(req, res) {
  await USER_DB.init();
  const { code: authToken } = querystring.parse(req.url.split("?").pop());

  if (!authToken) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const formData = querystring.stringify({
    grant_type: "authorization_code",
    authToken,
    redirect_uri: SPOTIFY_REDIRECT,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });

  const accessRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": formData.length,
    },
    body: formData,
  });

  const tokenData = await accessRes.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  const userRes = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      "Content-type": MIME.json,
      Authorization: `Bearer ${access_token}`,
    },
  });

  const userData = await userRes.json();
  const spotifyUserId = uuid();
  const spotifySessionId = uuid();

  // if cookie exists, then simply update the store with the refresh_token
  if (isCookieAndSessionValid(req)) {
    const sid = cookie.parse(req.headers.cookie).sessionid;
    const stored = Store.get(sid);

    if (!stored) {
      sendJsonErr(res, ERR.userNotFound);
      return;
    }

    Store.store(sid, { uid: stored.uid, spotifyRefreshToken: refresh_token });
    redirect(res, "/dashboard");
    return;
  }

  const existingUser = await USER_DB.getUser({ email: userData.email });

  if (existingUser) {
    Store.store(spotifySessionId, {
      uid: existingUser._id,
      spotifyRefreshToken: refresh_token,
    });
  } else {
    USER_DB.pushUser(
      new User(
        spotifyUserId,
        userData.display_name,
        userData.email,
        generatePassword(16)
      )
    );
    Store.store(spotifySessionId, {
      uid: spotifyUserId,
      spotifyRefreshToken: refresh_token,
    });
  }

  setSessionIdAndRedirect(res, spotifySessionId);
}

async function getSpotifyAccessTokenFromRefreshToken(refreshToken) {
  const query = querystring.transpose({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: query,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await tokenRes.json();
  return data?.access_token;
}

module.exports = {
  handleRouteAuthSpotify,
  handleRouteAuthSpotifyCallback,
  getSpotifyAccessTokenFromRefreshToken,
};

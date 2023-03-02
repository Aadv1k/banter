const crypto = require("crypto");
const fetch = require("node-fetch-commonjs");
const cookie = require("cookie");
const { v4: uuid} = require("uuid");
const querystring = require("querystring");
const { 
  MIME,
  ERR,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT
} = require("./constants");

const { Store } = require("../models/MemoryStore");
const { User, UserModel } = require("../models/UserModel");
const { sendJsonErr } = require("./common");

const USER_DB = new UserModel();

async function handleRouteAuthSpotify(req, res) {
  const scope = "user-read-private user-read-email";

  const spotifyQuery = querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    redirect_uri: SPOTIFY_REDIRECT,
    scope: scope,
  })

  const spotifyUrl = `https://accounts.spotify.com/authorize?${spotifyQuery}`;

  res.writeHead(302, {
    Location: spotifyUrl,
  })
  res.end();
}

async function handleRouteAuthSpotifyCallback(req, res) {
  await USER_DB.init();
  const parsedUrl = querystring.parse(req.url.split('?').pop());
  const formData = querystring.stringify({
    grant_type: 'authorization_code',
    code: parsedUrl.code,
    redirect_uri: SPOTIFY_REDIRECT,
    client_id: SPOTIFY_CLIENT_ID,
    client_secret: SPOTIFY_CLIENT_SECRET
  })

  const accessRes = await fetch(
    'https://accounts.spotify.com/api/token', 
    { 
      method: "POST", 
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        "Content-Length": formData.length
      },
      body: formData
    },
  )

  const tokenData = await accessRes.json();
  const access_token = tokenData.access_token;
  const refresh_token = tokenData.refresh_token;

  const userRes = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      "Content-type": MIME.json,
      "Authorization": `Bearer ${access_token}`
    },
  })

  const userData = await userRes.json();
  const spotifyUserId = uuid();
  const spotifySessionId = uuid();

  const existingUser = await USER_DB.getUser({email: userData.email});

  if (existingUser) {
    Store.store(spotifySessionId, {uid: existingUser._id})
    res.writeHead(302, {
      Location: "/dashboard",
      "Set-Cookie": `sessionid=${spotifySessionId}; path=/`
    })
    res.end();
    return;
  }

  USER_DB.pushUser(new User(spotifyUserId, userData.email, userData.display_name, generatePassword(16)));
  Store.store(spotifySessionId, {uid: spotifyUserId})

  res.writeHead(302, {
    Location: "/dashboard",
    "Set-Cookie": `sessionid=${spotifySessionId}`
  })
  res.end();
}

module.exports = {handleRouteAuthSpotify, handleRouteAuthSpotifyCallback}

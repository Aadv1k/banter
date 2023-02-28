const crypto = require("crypto");
const fetch = require("node-fetch-commonjs");
const cookie = require("cookie");
const querystring = require("querystring");
const { 
  ERR,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT
} = require("./constants");

const { Store } = require("../models/MemoryStore");
const { sendJsonErr } = require("./common");

async function handleRouteAuthSpotify(req, res) {
  const spotifyState = crypto.randomBytes(16).toString("hex")
  const scope = "user-read-private user-read-email";
  const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT)}&state=${spotifyState}`;

  const ck = cookie.parse(req.headers.cookie ?? "");
  if (!ck?.sessionid) {
    sendJsonErr(res, ERR.unauthorized);
    return;
  }

  const sessionData = Store.get(ck.sessionid);

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=refresh_token&refresh_token=' + sessionData.spotifyRefreshToken
    })

    const data = res.json()
    Store.update(ck.sessionid, {spotifyAccessToken: data.access_token});
    res.writeHead(302, {
      Location: "/dashboard",
    })
    res.end();
  } catch {
    res.writeHead(302, {
      Location: spotifyUrl,
    })
    res.end();
  }
}

async function handleRouteAuthSpotifyCallback(req, res) {
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

  const ck = cookie.parse(req.headers.cookie);
  if (!ck?.sessionid) {
    sendJsonErr(res, ERR.unableToFindUser);
    return;
  }

  const data = await accessRes.json();
  const access_token = data.access_token;
  const refresh_token = data.refresh_token;

  Store.update(ck.sessionid, {spotifyAccessToken: access_token, spotifyRefreshToken: refresh_token});

  res.writeHead(302, {
    Location: "/dashboard",
  });
  res.end();
}

module.exports = {handleRouteAuthSpotify, handleRouteAuthSpotifyCallback}

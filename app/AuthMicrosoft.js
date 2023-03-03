const { sendJsonErr, isCookieAndSessionValid, generatePassword} = require("./common");
const {
  ERR,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT,
} = require("./constants");

const { v4: uuid } = require("uuid");
const fetch = require("node-fetch-commonjs");
const querystring = require("querystring");
const { Store } = require("../models/MemoryStore.js");
const { User, UserModel } = require("../models/UserModel.js");
const USER_DB = new UserModel();

function handleRouteAuthMS(req, res) {
  const query = querystring.stringify({
    response_type: "code",
    client_id: MS_CLIENT_ID,
    redirect_uri: MS_REDIRECT,
    scope: "openid profile email",
  });
  const MSUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`;
  res.writeHead(302, { Location: MSUrl });
  res.end();
}

async function handleRouteAuthMSCallback(req, res) {
  await USER_DB.init();

  const authToken = req.url.split("=").pop();

  // No auth token
  if (authToken.startsWith("/")) {
    res.writeHead(302, {"Location": "/"});
    res.end();
    return;
  };


  const formData = querystring.stringify({
    grant_type: "authorization_code",
    client_id: MS_CLIENT_ID,
    client_secret: MS_CLIENT_SECRET,
    redirect_uri: MS_REDIRECT,
    code: authToken,
  });

  const accessRes = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": formData.length,
      },
      body: formData,
    }
  );

  const accessData = await accessRes.json();
  const accessToken = accessData.access_token;
  const userRes = await fetch("https://graph.microsoft.com/oidc/userinfo", { method: "GET", headers: { Authorization: "Bearer " + accessToken, }, });
  const userData = await userRes.json();
  const dbUser = await USER_DB.getUser({email: userData.email});
  const sid = uuid();

  if (dbUser) {
    Store.store(sid, {uid: dbUser._id})
    res.writeHead(302, {
      Location: "/dashboard",
      "Set-Cookie": `sessionid=${sid}; path=/`,
    });
    res.end();
    return;
  }

  if (!userData.email) {
    sendJsonErr(res, ERR.internalErr);
    res.end();
    return;
  }

  const uid = uuid();

  await USER_DB.pushUser(new User(
    uid,
    `${userData.givenname} ${userData.familyname}`,
    userData.email,
    generatePassword(16),
    userData.
  ));

  Store.store(sid, {uid})

  res.writeHead(302, {
    Location: "/dashboard",
    "Set-Cookie": `sessionid=${sid}`,
  });

  res.end();
}

module.exports = { handleRouteAuthMS, handleRouteAuthMSCallback }

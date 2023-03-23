const {
  sendJsonErr,
  generatePassword,
  setSessionIdAndRedirect,
  redirect,
} = require("../app/common");

const crypto = require("crypto");

const {
  ERR,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT,
} = require("../app/constants");

const { Store } = require("../models/MemoryStore.js");
const { User, UserModel } = require("../models/UserModel.js");
const USER_DB = new UserModel();

const { v4: uuid} = require("uuid");

const fetch = require("node-fetch-commonjs");
const querystring = require("querystring");

const MS_SCOPES = "User.Read";

function handleRouteAuthMS(req, res) {
  const query = querystring.stringify({
    response_type: "code",
    client_id: MS_CLIENT_ID,
    redirect_uri: MS_REDIRECT,
    scope: MS_SCOPES,
    response_mode: 'query'
  });
  const MSUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`;
  redirect(res, MSUrl);
}

async function handleRouteAuthMSCallback(req, res) {
  await USER_DB.init();
  const { code: authToken } = querystring.parse(req.url.split("?").pop());


  if (!authToken) {
    sendJsonErr(res, ERR.badInput);
    return;
  }

  const accessTokenformData = querystring.stringify({
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
        "Content-Length": accessTokenformData.length,
      },
      body: accessTokenformData,
    }
  );

  const accessData = await accessRes.json();
  const accessToken = accessData.access_token;
  const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });

  const data = await userRes.json();
  const {displayName: username, userPrincipalName: email, error} = data;

  const newSid = uuid();
  const dbUser = await USER_DB.getUser({ email });

  if (dbUser) {
    Store.store(newSid, { uid: dbUser._id });
    setSessionIdAndRedirect(res, newSid);
    return;
  }

  if (error || !username || !email ) {
    sendJsonErr(res, ERR.internalErr);
    return;
  }


  const newUid = crypto.randomBytes(12).toString("hex");
  await USER_DB.pushUser(
    new User(
      newUid,
      username,
      email,
      generatePassword(16)
    )
  );

  Store.store(newSid, { uid: newUid });
  setSessionIdAndRedirect(res, newSid);
}

module.exports = { handleRouteAuthMS, handleRouteAuthMSCallback };

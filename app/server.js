const http = require("http");
const { existsSync, readFileSync } = require("fs");
const ejs = require("ejs");
const path = require("path");
const querystring = require("querystring");
const fetch = require("node-fetch-commonjs");

const {
  MIME,
  ERR,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT,
} = require("./constants");

const { User } = require("../models/UserModel.js");

function handleRouteFilepath(req, res) {
  const filename = req.url;
  const ext = filename.split(".").pop();

  if (!MIME[ext]) {
    return;
  }
  const filepath = path.join(__dirname, "../public", filename);

  if (existsSync(filepath)) {
    let file = readFileSync(filepath);
    res.writeHead(200, { "Content-type": MIME[ext] });
    res.write(file);
  }
}

function renderView(res, file, data) {
  const viewPath = path.join(__dirname, "../views", file);
  if (existsSync(viewPath)) {
    ejs.renderFile(viewPath, data ?? {}, (err, data) => {
      if (err) {
        console.error(err);
      }
      res.writeHead(200, { "Content-type": MIME.html });
      res.write(data);
    });
  } else {
  }
  res.end();
}

function sendJsonErr(res, err) {
  res.writeHead(err.code, { "Content-type": MIME.json });
  res.write(JSON.stringify(err));
}

function handleRouteAuthMS(req, res) {
  const query = querystring.stringify({
    response_type: "code",
    client_id: MS_CLIENT_ID,
    redirect_uri: MS_REDIRECT,
    scope: "openid profile email",
  });
  const MSUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`;
  res.writeHead(302, { Location: MSUrl });
}

async function handleRouteAuthMSCallback(req, res) {
  const authToken = req.url.split("=").pop();
  if (!authToken) redirect(res, "/");
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
  const userRes = await fetch("https://graph.microsoft.com/oidc/userinfo", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  const userData = await userRes.json();
  const user = new User(
    userData.given_name,
    userData.family_name,
    userData.email,
    /* TODO: USE A PROPER PASSWORD FUNCTION HERE  */
    "test"
  );
}

module.exports = http.createServer(async (req, res) => {
  const URI = req.url;
  const ext = req.url.split(".").pop();
  if (URI === "/") {
    renderView(res, "index.ejs");
  } else if (URI.startsWith("/auth/microsoft/callback")) {
    await handleRouteAuthMSCallback(req, res);
  } else if (URI.startsWith("/auth/microsoft")) {
    handleRouteAuthMS(req, res);
  } else if (ext) {
    handleRouteFilepath(req, res);
  } else {
    res.writeHead(404, {'Content-type': MIME.html});
    res.write("<h1>hello found</h1>");
  }
  res.end();
});

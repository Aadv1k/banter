const http = require("http");
const { existsSync } = require("fs");
const ejs = require("ejs");
const path = require("path");
const querystring = require("querystring");
const fetch = require("node-fetch-commonjs");

const {
  MIME,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT,
} = require("./constants");

const { User } = require("../models/UserModel.js");

function handleFilepath(res, url) {
  const filename = url.split("/").pop();
  const ext = filename.split(".").pop();

  if (!MIME[ext]) {
    handle404(res);
    return;
  }
  if (existsSync(`./public/${filename}`)) {
    let file = readFileSync(`./public/${filename}`);
    res.writeHead(200, { "Content-type": MIME[ext] });
    res.write(file);
  } else {
    // TODO: Handle 404
    res.writeHead(404, { "Content-type": MIME.html });
    res.write("<h1>not found</h1>");
  }
}

function renderView(res, file, data) {
  const viewPath = path.join(__dirname, "./views", file);
  if (existsSync(viewPath)) {
    ejs.renderFile(viewPath, data ?? {}, (err, data) => {
      if (err) {
        console.error(err);
      }
      res.writeHead(200, { "Content-type": MIME.html });
      res.write(data);
    });
  } else {
    // TODO: Handle 404
    res.writeHead(404, { "Content-type": MIME.html });
    res.write("<h1>not found</h1>");
  }
  res.end();
}

function redirect(res, loc) {
  res.writeHead(302, { Location: loc });
}

const normalizeURI = (uri) => {
  uri = uri.split("?").shift();
  return uri.endsWith("/") ? uri.substring(0, uri.length - 1) : uri;
};

module.exports = http.createServer(async (req, res) => {
  const RAW_URI = req.url;
  const URI = normalizeURI(req.url);
  const ext = req.url.split(".").pop();

  if (RAW_URI === "/") {
    renderView(res, "index.ejs", {});
  } else if (URI === "/auth/microsoft") {
    const query = querystring.stringify({
      response_type: "code",
      client_id: MS_CLIENT_ID,
      redirect_uri: MS_REDIRECT,
      scope: "openid profile email",
    });
    const MSUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${query}`;
    res.writeHead(302, { Location: MSUrl });
  } else if (URI === "/auth/microsoft/callback") {
    const authToken = RAW_URI.split("=").pop();
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
      /* TODO: USE A PROPER HASH FUNCTION HERE  */
      "test"
    );
    console.log(user);
  } else if (ext) {
    handleFilepath(res, url);
  }
  res.end();
});

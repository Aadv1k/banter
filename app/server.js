const http = require("http");
const { existsSync, readFileSync } = require("fs");
const ejs = require("ejs");
const path = require("path");
const querystring = require("querystring");
const fetch = require("node-fetch-commonjs");
const cookie = require("cookie");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");

const {
  MIME,
  ERR,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_REDIRECT,
} = require("./constants");

const { User, UserModel } = require("../models/UserModel.js");

const USER_DB = new UserModel();

function handleRouteFilepath(req, res) {
  const filename = req.url;
  const ext = filename.split(".").pop();

  if (!MIME[ext]) {
    renderView(res, "404.ejs", 404);
    return;
  }

  const filepath = path.join(__dirname, "../public", filename);

  if (existsSync(filepath)) {
    let file = readFileSync(filepath);
    res.writeHead(200, { "Content-type": MIME[ext] });
    res.write(file);
  } else {
    renderView(res, "404.ejs", 404);
  }
  res.end();
}

function renderView(res, file, code, data) {
  const viewPath = path.join(__dirname, "../views", file);
  if (existsSync(viewPath)) {
    ejs.renderFile(viewPath, data ?? {}, (err, data) => {
      if (err) {
        console.error(err);
      }
      res.writeHead(code, { "Content-type": MIME.html });
      res.write(data);
    });
  } else {
  }
  res.end();
}

function sendJsonErr(res, err) {
  res.writeHead(err.code, { "Content-type": MIME.json });
  res.write(JSON.stringify(err));
  res.end();
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
  res.end();
}

async function handleRouteAuthMSCallback(req, res) {
  await USER_DB.init();

  const authToken = req.url.split("=").pop();

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
  const uid = uuid();

  const user = new User(
    uid,
    `${userData.givenname} ${userData.familyname}`,
    userData.email,
    crypto.randomBytes(16).toString("hex")
  );

  const userExists = await USER_DB.userExists(user);

  if (userExists) {
    const sid = await USER_DB.getSessionIDFromUser(user);
    res.writeHead(302, {
      Location: "/dashboard",
      "Set-Cookie": `sessionid=${sid}; path=/`,
    });
    res.end();
    return;
  }


  if (!user.email) {
    console.log("something went wrong");
    res.writeHead(302, {
      Location: "/",
    });
    res.end();
    return;
  }


  await USER_DB.pushUser(user);
  const newSid = uuid();
  await USER_DB.pushSessionID(newSid, uid);
  res.writeHead(302, {
    Location: "/dashboard",
    "Set-Cookie": `sessionid=${newSid}`,
  });

  res.end();
}

async function handleRouteLogin(req, res) {
  let parsedCookie = cookie.parse(req.headers.cookie ?? "");
  await USER_DB.init();
  const user = await USER_DB.getUserFromSessionID(parsedCookie.sessionid);

  if (req.method === "GET") {
    if (parsedCookie.sessionid && user) {
      res.writeHead(302, { Location: "/dashboard" });
      res.end();
      return;
    }
    renderView(res, "login.ejs", 200);
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      const formData = querystring.parse(body);

      if (![formData.email, formData.name, formData.password].every((e) => e)) {
        sendJsonErr(res, ERR.badInput);
        return;
      }

      const newUserID = uuid();
      const newSessionID = uuid();
      const user = new User(
        newUserID,
        formData.name,
        formData.email,
        formData.password
      );
      const userExists = await USER_DB.userExists(user);

      if (userExists) {
        const sessionID = await USER_DB.getSessionIDFromUser(user);
        res.writeHead(302, {
          Location: "/dashboard",
          "Set-Cookie": `sessionid=${sessionID}`,
        });
        res.end();
        return;
      }

      await USER_DB.pushUser(user);
      await USER_DB.pushSessionID(newSessionID, newUserID);
      res.writeHead(302, {
        Location: "/dashboard",
        "Set-Cookie": `sessionid=${newSessionID}`,
      });
      res.end();
    });
  }
}

async function handleRouteDashboard(req, res) {
  console.log(req.headers.cookie);
  let parsedCookie = cookie.parse(req.headers.cookie ?? "");
  if (!parsedCookie.sessionid) {
    res.writeHead(302, { "Location": "/login" });
    res.end();
    return;
  }
  res.writeHead(200, { "Content-type": MIME.html });
  if (parsedCookie.sessionid) {
    await USER_DB.init();
    const user = await USER_DB.getUserFromSessionID(parsedCookie.sessionid);
    res.write(`welcome ${user.email}!`);
  }
  res.end();
}

function handleRouteLogout(req, res) {
  const ck = cookie.parse(req.headers.cookie ?? "");
  if (ck.sessionid) {
    res.writeHead(302, { Location: "/", "Set-Cookie": "sessionid=" });
  } else {
    res.writeHead(302, { Location: "/" });
  }
  res.end();
}

module.exports = http.createServer(async (req, res) => {
  const URI = req.url;
  const ext = req.url.split(".").pop();

  if (URI === "/") {
    renderView(res, "index.ejs", 200);
  } else if (URI.startsWith("/login")) {
    await handleRouteLogin(req, res);
  } else if (URI.startsWith("/logout")) {
    handleRouteLogout(req, res);
  } else if (URI.startsWith("/dashboard")) {
    handleRouteDashboard(req, res);
  } else if (URI.startsWith("/auth/microsoft/callback")) {
    await handleRouteAuthMSCallback(req, res);
  } else if (URI.startsWith("/auth/microsoft")) {
    handleRouteAuthMS(req, res);
  } else if (ext) {
    handleRouteFilepath(req, res);
  }
});

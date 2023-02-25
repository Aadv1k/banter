const { handleRouteAuthMSCallback, handleRouteAuthMS } = require("./AuthMicrosoft");

const {
  MIME,
  ERR,
} = require("./constants");

const { isCookieAndSessionValid, sendJsonErr } = require("./common");
const { User, UserModel } = require("../models/UserModel.js");
const { Store } = require("../models/MemoryStore");

const http = require("http");
const { existsSync, readFileSync } = require("fs");
const ejs = require("ejs");
const path = require("path");
const querystring = require("querystring");
const cookie = require("cookie");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");


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

async function handleRouteSignup(req, res) {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
      res.writeHead(302, { Location: "/dashboard" });
      res.end();
      return;
    }
    renderView(res, "signup.ejs", 200);
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      const formData = querystring.parse(body);

      if (![formData.name, formData.email, formData.password].every((e) => e)) {
        sendJsonErr(res, ERR.badInput);
        return;
      }

      const uid = uuid();
      const sid = uuid();

      const hashedPassword = crypto
        .createHash("md5")
        .update(formData.password)
        .digest("hex");

      const user = await USER_DB.getUser({ email: formData.email });
      if (user) {
        sendJsonErr(res, ERR.userExists);
        return;
      }

      await USER_DB.pushUser(
        new User(uid, formData.name, formData.email, hashedPassword)
      );

      Store.store(sid, { uid });

      res.writeHead(302, {
        Location: "/dashboard",
        "Set-Cookie": `sessionid=${sid}`,
      });
      res.end();
    });
  }
}

async function handleRouteLogin(req, res) {
  await USER_DB.init();

  if (req.method === "GET") {
    if (isCookieAndSessionValid(req)) {
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

      if (![formData.email, formData.password].every((e) => e)) {
        sendJsonErr(res, ERR.badInput);
        return;
      }

      const sid = uuid();

      const hashedPassword = crypto
        .createHash("md5")
        .update(formData.password)
        .digest("hex");

      const dbUser = await USER_DB.getUser({ email: formData.email });

      if (!dbUser) {
        sendJsonErr(res, ERR.userNotFound);
      } else if (dbUser.password != hashedPassword) {
        sendJsonErr(res, ERR.invalidPassword);
        return;
      }

      Store.store(sid, { uid: dbUser._id });

      res.writeHead(302, {
        Location: "/dashboard",
        "Set-Cookie": `sessionid=${sid}`,
      });
      res.end();
    });
  }
}

async function handleRouteDashboard(req, res) {
  await USER_DB.init();

  if (!isCookieAndSessionValid(req)) {
    sendJsonErr(ERR.unauthorized);
    return;
  }

  const uid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
  res.writeHead(200, { "Content-type": MIME.html });
  const user = await USER_DB.getUser({ _id: uid });

  if (!user) {
    sendJsonErr(ERR.unableToFindUser);
  }

  res.write(`welcome ${user.email}`);
  res.end();
}

function handleRouteLogout(req, res) {
  const ck = cookie.parse(req.headers.cookie ?? "");
  if (ck.sessionid) {
    Store.rm(ck.sessionid);
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
  } else if (URI.startsWith("/signup")) {
    await handleRouteSignup(req, res);
  } else if (URI.startsWith("/logout")) {
    handleRouteLogout(req, res);
  } else if (URI.startsWith("/dashboard")) {
    await handleRouteDashboard(req, res);
  } else if (URI.startsWith("/auth/microsoft/callback")) {
    await handleRouteAuthMSCallback(req, res);
  } else if (URI.startsWith("/auth/microsoft")) {
    handleRouteAuthMS(req, res);
  } else if (ext) {
    handleRouteFilepath(req, res);
  }
});

const {
  handleRouteAuthMSCallback,
  handleRouteAuthMS,
} = require("../routes/AuthMicrosoft");

const {
  handleRouteAuthSpotify,
  handleRouteAuthSpotifyCallback,
} = require("../routes/AuthSpotify");

const routeFilepath = require("../routes/Filepath");
const routeDashboard = require("../routes/Dashboard");
const routeLogin = require("../routes/Login");
const routeLogout = require("../routes/Logout");
const routeSignup = require("../routes/Signup");
const routeCreateEpisode = require("../routes/CreateEpisode.js");
const routeCreatePodcast = require("../routes/CreatePodcast.js");
const routeRSS = require("../routes/RSS.js");
const routeGetPodcast = require("../routes/GetPodcast.js");
const routeGetEpisode = require("../routes/GetEpisode.js");

const http = require("http");
const { renderView } = require("./common");
const { MIME } = require("./constants");

module.exports = http.createServer(async (req, res) => {
  const URI = req.url;
  const ext = req.url.split(".").pop();

  if (URI === "/") {
    renderView(req, res, "index.ejs", 200, {}, true);
  } else if (MIME[ext]) {
    routeFilepath(req, res);
  } else if (URI.startsWith("/login")) {
    await routeLogin(req, res);
  } else if (URI.startsWith("/signup")) {
    await routeSignup(req, res);
  } else if (URI.startsWith("/logout")) {
    routeLogout(req, res);
  } else if (URI.startsWith("/dashboard")) {
    await routeDashboard(req, res);
  } else if (URI.startsWith("/auth/microsoft/callback")) {
    await handleRouteAuthMSCallback(req, res);
  } else if (URI.startsWith("/auth/microsoft")) {
    handleRouteAuthMS(req, res);
  } else if (URI.startsWith("/auth/spotify/callback")) {
    await handleRouteAuthSpotifyCallback(req, res);
  } else if (URI.startsWith("/auth/spotify")) {
    handleRouteAuthSpotify(req, res);
  } else if (URI.startsWith("/createEpisode")) {
    routeCreateEpisode(req, res);
  } else if (URI.startsWith("/getPodcast")) {
    routeGetPodcast(req, res);
  } else if (URI.startsWith("/createPodcast")) {
    routeCreatePodcast(req, res);
  } else if (URI.startsWith("/getEpisode")) {
    routeGetEpisode(req, res);
  }
  else if (URI.startsWith("/rss")) {
    routeRSS(req, res)
  } else {
    renderView(req, res, "404.ejs", 404, {}, true);
  }
});

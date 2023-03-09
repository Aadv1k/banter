const { handleRouteAuthMSCallback, handleRouteAuthMS } = require("../routes/AuthMicrosoft");
const { handleRouteAuthSpotify, handleRouteAuthSpotifyCallback } = require("../routes/AuthSpotify");;

const routeFilepath = require("../routes/Filepath");
const routeUploadEpisode = require("../routes/UploadEpisode");
const routeDashboard = require("../routes/Dashboard");
const routeLogin = require("../routes/Login");
const routeLogout = require("../routes/Logout");
const routeSignup = require("../routes/Signup");

const http = require("http");
const { renderView } = require("./common");
const { MIME } = require("./constants");


module.exports = http.createServer(async (req, res) => {
	const URI = req.url;
	const ext = req.url.split(".").pop();

	if (URI === "/") {
		renderView(res, "index.ejs", 200);
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
	} else if (URI.startsWith("/upload-episode")) {
    routeUploadEpisode(req, res);
  } else {
    renderView(res, "404.ejs");
  }
});

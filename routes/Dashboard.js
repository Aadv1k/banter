const { Store } = require("../models/MemoryStore");

const { UserModel } = require("../models/UserModel");

const cookie = require("cookie");

const USER_DB = new UserModel();

const {
	MIME,
} = require("../app/constants");

const { 
  isCookieAndSessionValid, 
  redirect,
  renderView
} = require("../app/common");

module.exports = async (req, res) => {
	await USER_DB.init();

	if (!isCookieAndSessionValid(req)) {
		redirect(res, "/login");
		return;
	}

	const uid = Store.get(cookie.parse(req.headers.cookie).sessionid).uid;
	const spotifyRefreshToken = Store.get(cookie.parse(req.headers.cookie).sessionid)?.spotifyRefreshToken;
	res.writeHead(200, { "Content-type": MIME.html });

	const user = await USER_DB.getUser({ _id: uid });

	if (!user) {
    Store.rm(sessionid);
		redirect(res, "/login");
    return;
	}

  renderView(res, "dashboard.ejs", 200, {spotifyLoggedIn: Boolean(spotifyRefreshToken), user, });
}

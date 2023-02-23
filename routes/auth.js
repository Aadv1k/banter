const crypto = require("crypto");
const fetch = require("node-fetch-commonjs");

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
    userData.display_name,
    userData.email,
    crypto.randomBytes(16).toString("hex")
  );

  const userExists = await USER_DB.userExists(user);
  res.writeHead(200, { "Content-type": MIME.html });

  if (userExists) {
    res.write(`<h1>Welcome back ${user.email}</h1>`);
  } else {
    await USER_DB.pushUser(user);
    res.write(`<h1>Registered ${user.email}</h1>`);
  }

  res.end();
}

module.exports = {handleRouteAuthMS, handleRouteAuthMSCallback}

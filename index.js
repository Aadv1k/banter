const server = require("./app/server.js");
const { PORT } = require("./common/constants.js");

server.listen(PORT, () => {
  console.log("server listening on port http://localhost:" + PORT);
});


require("dotenv").config();
const { createServer } = require("http")
const config = require("./src/config/config");
const app = require("./src/app");

require("./src/utils/redisConnection");
const connect = require("./src/db/db");
connect();

const socketConnection = require("./src/utils/socketConnection");

const httpServer = createServer(app);
socketConnection(httpServer);

httpServer.listen(config.PORT, function(){
    console.log(`app is running on port ${config.PORT}`);
})

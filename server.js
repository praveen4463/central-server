const Console = console;
const config = require("./config");
const app = require("./app");
app.listen(config.apiPort, () => {
	Console.log(`central server's api listening on port ${config.apiPort}`);
});
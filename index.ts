import * as dotenv from "dotenv";
dotenv.config();

import { client } from "./bot";
import { deployDev, deployProd } from "./bot/utils/deploy";
import { app } from "./server";

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.DEV_GUILD_ID;

if (typeof token === "undefined") throw new Error("Missing TOKEN in env");
if (typeof clientId === "undefined")
  throw new Error("Missing CLIENT_ID in env");

const argv = process.argv.slice(2);
switch (argv[0]) {
  case "run":
    app.listen(3000, () => {
      return console.log(`Server is listening on port 3000`);
    });
    client.login(token);
    break;
  case "deploy:prod":
    deployProd(token, clientId);
    break;
  case "deploy:dev":
    if (typeof guildId === "undefined")
      throw new Error("Missing DEV_GUILD_ID in env");
    deployDev(token, clientId, guildId);
    break;
}

import * as dotenv from "dotenv";
dotenv.config();

import { client } from "./bot";
import { deployDev, deployProd } from "./bot/utils/deploy";
import { app } from "./server";

const token = process.env.TOKEN as string;
const clientId = process.env.CLIENT_ID as string;
const guildId = process.env.DEV_GUILD_ID as string;

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
    deployDev(token, clientId, guildId);
    break;
}

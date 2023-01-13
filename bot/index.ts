import { Client, Events, GatewayIntentBits } from "discord.js";
import { commandCollection } from "./commands";
import { onMemberLeave } from "./listeners/onLeave";
import { slashCommandListener } from "./listeners/onSlashCmd";
import { ssoAuthButtonListener } from "./listeners/onAuth";

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
client.commands = commandCollection;

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, slashCommandListener);
client.on(Events.InteractionCreate, ssoAuthButtonListener);
client.on(Events.GuildMemberRemove, onMemberLeave);

import { REST, Routes } from "discord.js";
import { commands } from "../commands";

const jsonCmd = commands.map((cmd) => cmd.data.toJSON());

export async function deployDev(
  token: string,
  clientId: string,
  guildId: string
) {
  const rest = new REST({ version: "10" }).setToken(token as string);
  try {
    console.log(`Refreshing commands.`);

    const data = (await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: jsonCmd }
    )) as any[];

    console.log(`Reloaded ${data.length} commands.`);
  } catch (error) {
    console.error(error);
  }
}

export async function deployProd(token: string, clientId: string) {
  const rest = new REST({ version: "10" }).setToken(token as string);
  try {
    console.log(`Refreshing commands.`);

    const data = (await rest.put(Routes.applicationCommands(clientId), {
      body: jsonCmd,
    })) as any[];

    console.log(`Reloaded ${data.length} commands.`);
  } catch (error) {
    console.error(error);
  }
}

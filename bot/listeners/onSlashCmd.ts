import {
  CacheType,
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";
import { BotCommand } from "../types";

export async function slashCommandListener(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isChatInputCommand()) return;

  const command: BotCommand<ChatInputCommandInteraction> | undefined =
    interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}

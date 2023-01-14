import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { BotCommand } from "../types";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    const start = new Date().getTime();
    await interaction.reply({ content: "Pong!", ephemeral: true });
    const delta = new Date().getTime() - start;
    interaction.editReply(`Pong! (${delta}ms)`);
  },
} as BotCommand<ChatInputCommandInteraction<CacheType>>;

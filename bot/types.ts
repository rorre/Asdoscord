import {
  CacheType,
  Interaction,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";

export interface BotCommand<T extends Interaction> {
  data: SlashCommandBuilder;
  execute: (interaction: T) => Promise<void>;
}

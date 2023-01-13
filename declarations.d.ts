import { Client, Collection } from "discord.js";

declare module "discord.js" {
  interface Client<Ready extends boolean = boolean> {
    commands: Collection<string, BotCommand<ChatInputCommandInteraction>>;
  }
}

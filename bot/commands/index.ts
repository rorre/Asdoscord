import { Collection, ChatInputCommandInteraction } from "discord.js";
import { BotCommand } from "../types";
import PingCommand from "./ping";
import SetupCommand from "./setup";
import { SendAnonCommand, RevealByUidCommand } from "./anon";

export const commands: BotCommand<ChatInputCommandInteraction>[] = [
  PingCommand,
  SetupCommand,
  SendAnonCommand,
  RevealByUidCommand,
];

export const commandCollection = new Collection<
  string,
  BotCommand<ChatInputCommandInteraction>
>();

commands.forEach((cmd) => commandCollection.set(cmd.data.name, cmd));

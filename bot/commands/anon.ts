import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import LRUCache from "lru-native2";
import { calculateHash } from "../../shared/crypto";
import { prisma } from "../../shared/prisma";
import { BotCommand } from "../types";

const usernameCache = new LRUCache<string>({
  size: 500,
  maxElements: 1000,
  maxLoadFactor: 2.0,
});

export default {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Sends an anonymous message to current channel")
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription("Message to be send")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) return;

    const message = interaction.options.getString("message", true);
    let ssoUsername = usernameCache.get(
      interaction.guildId + "-" + interaction.user.id
    );
    if (!ssoUsername) {
      const user = await prisma.serverMember.findUnique({
        select: { ssoUsername: true },
        where: {
          serverId_discordId: {
            serverId: interaction.guildId,
            discordId: interaction.user.id,
          },
        },
      });

      if (!user) {
        return await interaction.reply({
          content: "You have not been verified.",
          ephemeral: true,
        });
      }
      ssoUsername = user?.ssoUsername;
    }

    const messageEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setDescription(`> ${message}`)
      .setFooter({
        text: `UID: ${calculateHash(ssoUsername).slice(0, 6)}`,
      });

    await interaction.channel?.send({ embeds: [messageEmbed] });
    await interaction.reply({ content: "Sent!", ephemeral: true });

    await prisma.message.create({
      data: {
        ssoUsername: ssoUsername,
        serverId: interaction.guildId,
        message,
      },
    });
  },
} as BotCommand<ChatInputCommandInteraction<CacheType>>;

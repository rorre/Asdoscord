import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  userMention,
} from "discord.js";
import { calculateHash } from "../../shared/crypto";
import { prisma } from "../../shared/prisma";
import { BotCommand } from "../types";
import { usernameCache } from "../utils/caches";
import { stripIndents } from "common-tags";

export const SendAnonCommand: BotCommand<
  ChatInputCommandInteraction<CacheType>
> = {
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
    await interaction.deferReply({ ephemeral: true });
    const message = interaction.options.getString("message", true);

    const cacheKey = interaction.guildId + "-" + interaction.user.id;
    let ssoUsername = usernameCache.get(cacheKey);
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
        await interaction.editReply("You have not been verified.");
        return;
      }
      ssoUsername = user.ssoUsername;
      usernameCache.set(cacheKey, ssoUsername);
    }

    const messageEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setDescription(`> ${message}`)
      .setFooter({
        text: `UID: \`${calculateHash(ssoUsername)}\``,
      });

    await prisma.message.create({
      data: {
        ssoUsername: ssoUsername,
        serverId: interaction.guildId,
        message,
      },
    });

    await interaction.channel?.send({ embeds: [messageEmbed] });
    await interaction.editReply("Sent!");
  },
};

export const RevealByUidCommand: BotCommand<
  ChatInputCommandInteraction<CacheType>
> = {
  data: new SlashCommandBuilder()
    .setName("reveal-uid")
    .setDescription("Reveals user with given UID")
    .addStringOption((opt) =>
      opt.setName("uid").setDescription("UID to lookup").setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) return;
    await interaction.deferReply({ ephemeral: true });

    const uid = interaction.options.getString("uid", true);
    const members = await prisma.serverMember.findMany({
      where: { serverId: interaction.guildId },
    });
    const filteredMember = members.filter(
      (m) => calculateHash(m.ssoUsername) == uid
    );
    if (filteredMember.length == 0) {
      await interaction.editReply("Cannot find user with given UID.");
      return;
    }

    await interaction.editReply(
      stripIndents`
      Members:

      ${filteredMember
        .map((m) => `${m.ssoUsername} | ${userMention(m.discordId)}`)
        .join("\n")}
    `
    );
  },
};

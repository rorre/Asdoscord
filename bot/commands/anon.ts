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
        return await interaction.reply({
          content: "You have not been verified.",
          ephemeral: true,
        });
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
      return await interaction.reply("Cannot find user with given UID.");
    }

    await interaction.reply({
      ephemeral: true,
      content: stripIndents`
      Members:

      ${filteredMember
        .map((m) => `${m.ssoUsername} | ${userMention(m.discordId)}`)
        .join("\n")}
    `,
    });
  },
};

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { prisma } from "../../shared/prisma";
import { BotCommand } from "../types";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Setup server for use")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel where verification button will be posted")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role to add for verified users")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("authSSO")
        .setLabel("Log in")
        .setStyle(ButtonStyle.Primary)
    );

    const targetChannel = interaction.options.getChannel("channel");
    if (targetChannel?.type != ChannelType.GuildText) {
      return await interaction.reply("Use a text channel for verification!");
    }

    const verifyRole = interaction.options.getRole("role", true);
    await (targetChannel as TextChannel).send({
      content: "Silakan verifikasi dengan akun SSO UI.",
      components: [row],
    });

    await prisma.serverConfig.upsert({
      where: { id: interaction.guildId! },
      update: {
        verifiedRoleId: verifyRole.id,
      },
      create: {
        id: interaction.guildId!,
        verifiedRoleId: verifyRole.id,
      },
    });

    await interaction.reply("Done!");
  },
} as BotCommand<ChatInputCommandInteraction<CacheType>>;

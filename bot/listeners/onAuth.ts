import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  Interaction,
} from "discord.js";
import { client } from "..";
import { encrypt } from "../../shared/crypto";
import { prisma } from "../../shared/prisma";

export async function ssoAuthButtonListener(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isButton()) return;
  if (!interaction.inGuild()) return;
  if (interaction.customId !== "authSSO") return;

  const encryptedIdent = encrypt(
    interaction.guildId + "-" + interaction.user.id
  );
  const LINK = `https://sso.ui.ac.id/cas2/login?service=${process.env.SERVICE_URL}/${encryptedIdent}`;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Log in")
      .setURL(LINK)
      .setStyle(ButtonStyle.Link)
  );
  await interaction.reply({
    content: "Harap log in dengan meng-klik tombol berikut",
    ephemeral: true,
    components: [row],
  });
}

export async function verifyUser(guildId: string, userId: string) {
  const guildCfg = await prisma.serverConfig.findFirstOrThrow({
    where: { id: guildId },
  });

  const guild = await client.guilds.fetch(guildId);
  const user = await guild.members.fetch(userId);
  if (user.roles.cache.some((r) => r.id == guildCfg.verifiedRoleId)) {
    throw Error("User already verified");
  }

  await user.roles.add(guildCfg.verifiedRoleId);
}

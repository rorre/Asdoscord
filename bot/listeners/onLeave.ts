import { GuildMember, PartialGuildMember } from "discord.js";
import { prisma } from "../../shared/prisma";

export async function onMemberLeave(member: GuildMember | PartialGuildMember) {
  await prisma.serverMember.deleteMany({
    where: {
      discordId: member.id,
      serverId: member.guild.id,
    },
  });
}

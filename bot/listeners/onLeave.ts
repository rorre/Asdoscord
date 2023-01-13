import { GuildMember, PartialGuildMember } from "discord.js";
import { prisma } from "../../shared/prisma";
import { usernameCache } from "../utils/caches";

export async function onMemberLeave(member: GuildMember | PartialGuildMember) {
  await prisma.serverMember.deleteMany({
    where: {
      discordId: member.id,
      serverId: member.guild.id,
    },
  });

  usernameCache.remove(member.guild.id + "-" + member.user.id);
}

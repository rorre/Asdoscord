import SSOClient from "./sso";
import express from "express";
import { decrypt } from "../shared/crypto";
import { prisma } from "../shared/prisma";
import { Prisma } from "@prisma/client";
import { verifyUser } from "../bot/listeners/onAuth";

export const app = express();
const ssoClient = new SSOClient("http://localhost:3000/callback");

app.get("/callback/:ident", async (req, res) => {
  let gid, uid;
  try {
    [gid, uid] = decrypt(req.params.ident).split("-");
  } catch {
    return res.send("Invalid identifier");
  }

  let user;
  try {
    user = await ssoClient.authenticate(
      req.query.ticket as any,
      req.params.ident
    );
  } catch (err) {
    return res.send((err as Error).message);
  }

  if (!("npm" in user.attributes)) {
    return res.send("Otentikasi hanya untuk mahasiswa, maaf.");
  }

  await prisma.user.upsert({
    where: { username: user.user },
    update: {
      npm: user.attributes.npm,
      name: user.attributes.nama,
    },
    create: {
      username: user.user,
      npm: user.attributes.npm,
      name: user.attributes.nama,
    },
  });

  const existing = await prisma.serverMember.findUnique({
    where: {
      ssoUsername_serverId: {
        ssoUsername: user.user,
        serverId: gid,
      },
    },
  });

  if (existing) {
    if (existing.discordId != uid) {
      return res.send(
        "Akun SSO sudah dipakai di server ini. Hanya ada satu akun discord yang bisa terkait dengan akun SSO."
      );
    }
  } else {
    try {
      await prisma.serverMember.create({
        data: {
          ssoUsername: user.user,
          serverId: gid,
          discordId: uid,
        },
      });
      await verifyUser(gid, uid);
    } catch (e) {
      return res.send("An unknown error occured.");
    }
  }
  res.redirect("/done");
});

app.get("/done", (req, res) => {
  res.send("Authenticated. You can come back to the server now.");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

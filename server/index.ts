import SSOClient from "./sso";
import express from "express";
import { decrypt } from "../shared/crypto";
import { prisma } from "../shared/prisma";
import mustacheExpress from "mustache-express";
import { verifyUser } from "../bot/listeners/onAuth";

export const app = express();
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

const ssoClient = new SSOClient("http://localhost:3000/callback");

app.get("/callback/:ident", async (req, res) => {
  let gid, uid;
  try {
    [gid, uid] = decrypt(req.params.ident).split("-");
  } catch {
    return res.render("notice", {
      icon: "times-circle",
      message: "Invalid identifier",
    });
  }

  let user;
  try {
    user = await ssoClient.authenticate(
      req.query.ticket as any,
      req.params.ident
    );
  } catch (err) {
    return res.render("notice", {
      icon: "times-circle",
      message: (err as Error).message,
    });
  }

  if (!("npm" in user.attributes)) {
    return res.render("notice", {
      icon: "times-circle",
      message: "Otentikasi hanya untuk mahasiswa, maaf.",
    });
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
      return res.render("notice", {
        icon: "times-circle",
        message:
          "Akun SSO sudah dipakai di server ini. Hanya ada satu akun discord yang bisa terkait dengan akun SSO.",
      });
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
      return res.render("notice", {
        icon: "times-circle",
        message: "An unknown error occured.",
      });
    }
  }
  res.redirect("/done");
});

app.get("/done", (req, res) => {
  res.render("notice", {
    icon: "check-circle",
    message: "Authenticated. You can come back to the server now.",
  });
});

app.get("/", (req, res) => {
  res.redirect("https://github.com/rorre/Asdoscord");
});

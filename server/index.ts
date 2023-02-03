import SSOClient from "./sso";
import express from "express";
import { decrypt } from "../shared/crypto";
import { prisma } from "../shared/prisma";
import mustacheExpress from "mustache-express";
import { verifyUser } from "../bot/listeners/onAuth";
import crypto from "crypto";

export const app = express();
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

const serviceUrl = process.env.SERVICE_URL;
if (typeof serviceUrl === "undefined")
  throw new Error("Missing SERVICE_URL in env");

const ssoClient = new SSOClient(serviceUrl);

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

  let username;
  try {
    username = await ssoClient.authenticate(
      req.query.ticket as any,
      req.params.ident
    );
  } catch (err) {
    return res.render("notice", {
      icon: "times-circle",
      message: (err as Error).message,
    });
  }

  // if (!("npm" in username.attributes)) {
  //   return res.render("notice", {
  //     icon: "times-circle",
  //     message: "Otentikasi hanya untuk mahasiswa, maaf.",
  //   });
  // }

  const fakeNpm = crypto.randomBytes(20).toString("hex");
  await prisma.user.upsert({
    where: { username: username },
    update: {
      npm: fakeNpm,
      name: "",
    },
    create: {
      username: username,
      npm: fakeNpm,
      name: "",
    },
  });

  const existing = await prisma.serverMember.findUnique({
    where: {
      ssoUsername_serverId: {
        ssoUsername: username,
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
          ssoUsername: username,
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

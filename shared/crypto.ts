import crypto from "crypto";

const CIPHER = "aes-256-cbc";
const NONCE_SIZE = 16;
const KEY = process.env.SECRET;
if (typeof KEY === "undefined") throw new Error("Missing SECRET in env");

export function encrypt(plaintext: string) {
  const nonce = crypto.randomBytes(NONCE_SIZE);
  const cipher = crypto.createCipheriv(CIPHER, KEY!, nonce);
  const cipherBuf = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([nonce, cipherBuf]).toString("base64url");
}

export function decrypt(cipherText: string) {
  const fullCipherBuf = Buffer.from(cipherText, "base64url");

  const nonce = fullCipherBuf.slice(0, NONCE_SIZE);
  const cipherBytes = fullCipherBuf.slice(NONCE_SIZE, fullCipherBuf.length);

  const cipher = crypto.createDecipheriv(CIPHER, KEY!, nonce);
  const resultBuf = Buffer.concat([cipher.update(cipherBytes), cipher.final()]);
  return resultBuf.toString("utf-8");
}

export function calculateHash(ident: string) {
  const hash = crypto.createHash("sha256");
  hash.update(KEY!);
  hash.update(ident);
  return hash.digest().toString("hex");
}

import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ENVELOPE_PREFIX = "enc:v1:";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

type DecryptionResult = {
  value: string;
  isLegacyPlaintext: boolean;
};

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.USER_SETTINGS_ENCRYPTION_KEY;

  if (!keyBase64) {
    throw new Error("USER_SETTINGS_ENCRYPTION_KEY is not set");
  }

  const key = Buffer.from(keyBase64, "base64");

  if (key.length !== 32) {
    throw new Error(
      "USER_SETTINGS_ENCRYPTION_KEY must decode to exactly 32 bytes (base64)"
    );
  }

  return key;
}

export function encryptUserSettingValue(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENVELOPE_PREFIX}${iv.toString("base64url")}.${encrypted.toString(
    "base64url"
  )}.${authTag.toString("base64url")}`;
}

export function decryptUserSettingValue(value: string): DecryptionResult {
  if (!value.startsWith(ENVELOPE_PREFIX)) {
    console.warn(
      "[Security] Plaintext setting value detected. Consider re-saving to encrypt."
    );
    return {
      value,
      isLegacyPlaintext: true,
    };
  }

  const encodedPayload = value.slice(ENVELOPE_PREFIX.length);
  const [encodedIv, encodedCiphertext, encodedAuthTag] =
    encodedPayload.split(".");

  if (!encodedIv || !encodedCiphertext || !encodedAuthTag) {
    throw new Error("Invalid encrypted settings envelope format");
  }

  const iv = Buffer.from(encodedIv, "base64url");
  const ciphertext = Buffer.from(encodedCiphertext, "base64url");
  const authTag = Buffer.from(encodedAuthTag, "base64url");

  if (
    iv.length !== IV_LENGTH_BYTES ||
    authTag.length !== AUTH_TAG_LENGTH_BYTES
  ) {
    throw new Error("Invalid encrypted settings envelope payload");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  return {
    value: decrypted,
    isLegacyPlaintext: false,
  };
}

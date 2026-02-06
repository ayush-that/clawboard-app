import "server-only";

import { eq } from "drizzle-orm";
import {
  decryptUserSettingValue,
  encryptUserSettingValue,
} from "@/lib/security/user-settings-crypto";
import { ChatSDKError } from "../../errors";
import { type User, user, userSettings } from "../schema";
import { generateHashedPassword } from "../utils";
import { db } from "./connection";

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function getOrCreateUserByEmail(email: string): Promise<User> {
  const existing = await getUser(email);
  if (existing.length > 0) {
    return existing.at(0) as User;
  }

  try {
    const [newUser] = await db.insert(user).values({ email }).returning();
    return newUser;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create user from OAuth"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function getUserSettings(userId: string) {
  try {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      return null;
    }

    const decryptedGatewayToken = settings.openclawGatewayToken
      ? decryptUserSettingValue(settings.openclawGatewayToken).value
      : null;
    const decryptedTamboApiKey = settings.tamboApiKey
      ? decryptUserSettingValue(settings.tamboApiKey).value
      : null;

    return {
      ...settings,
      openclawGatewayToken: decryptedGatewayToken,
      tamboApiKey: decryptedTamboApiKey,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user settings"
    );
  }
}

export async function saveUserSettings(
  userId: string,
  settings: {
    openclawGatewayUrl?: string | null;
    openclawGatewayToken?: string | null;
    tamboApiKey?: string | null;
  }
) {
  try {
    const existing = await getUserSettings(userId);

    const nextGatewayUrl =
      settings.openclawGatewayUrl === undefined
        ? (existing?.openclawGatewayUrl ?? null)
        : settings.openclawGatewayUrl;
    const nextGatewayToken =
      settings.openclawGatewayToken === undefined
        ? (existing?.openclawGatewayToken ?? null)
        : settings.openclawGatewayToken;
    const nextTamboApiKey =
      settings.tamboApiKey === undefined
        ? (existing?.tamboApiKey ?? null)
        : settings.tamboApiKey;

    const valuesToPersist = {
      openclawGatewayUrl: nextGatewayUrl,
      openclawGatewayToken: nextGatewayToken
        ? encryptUserSettingValue(nextGatewayToken)
        : null,
      tamboApiKey: nextTamboApiKey
        ? encryptUserSettingValue(nextTamboApiKey)
        : null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(userSettings)
        .set(valuesToPersist)
        .where(eq(userSettings.userId, userId))
        .returning();
    } else {
      await db
        .insert(userSettings)
        .values({ userId, ...valuesToPersist })
        .returning();
    }

    return {
      userId,
      openclawGatewayUrl: nextGatewayUrl,
      openclawGatewayToken: nextGatewayToken,
      tamboApiKey: nextTamboApiKey,
      updatedAt: new Date(),
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save user settings"
    );
  }
}

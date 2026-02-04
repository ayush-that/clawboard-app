import { auth } from "@/app/(auth)/auth";
import { getUserSettings, saveUserSettings } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const settings = await getUserSettings(session.user.id);

  return Response.json({
    openclawGatewayUrl: settings?.openclawGatewayUrl ?? "",
    hasOpenclawGatewayToken: Boolean(settings?.openclawGatewayToken),
    hasTamboApiKey: Boolean(settings?.tamboApiKey),
    updatedAt: settings?.updatedAt?.toISOString() ?? null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object") {
    return new ChatSDKError(
      "bad_request:api",
      "Invalid request body"
    ).toResponse();
  }

  const payload = body as Record<string, unknown>;
  const hasGatewayUrl = Object.hasOwn(payload, "openclawGatewayUrl");
  const hasGatewayToken = Object.hasOwn(payload, "openclawGatewayToken");
  const hasTamboApiKey = Object.hasOwn(payload, "tamboApiKey");

  if (!hasGatewayUrl && !hasGatewayToken && !hasTamboApiKey) {
    return new ChatSDKError(
      "bad_request:api",
      "No fields provided"
    ).toResponse();
  }

  const nextGatewayUrl = hasGatewayUrl
    ? normalizeNullableString(payload.openclawGatewayUrl)
    : undefined;
  const nextGatewayToken = hasGatewayToken
    ? normalizeNullableString(payload.openclawGatewayToken)
    : undefined;
  const nextTamboApiKey = hasTamboApiKey
    ? normalizeNullableString(payload.tamboApiKey)
    : undefined;

  if (hasGatewayUrl && nextGatewayUrl) {
    try {
      const parsed = new URL(nextGatewayUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return new ChatSDKError(
          "bad_request:api",
          "OpenClaw gateway URL must use http or https."
        ).toResponse();
      }
    } catch {
      return new ChatSDKError(
        "bad_request:api",
        "OpenClaw gateway URL is invalid."
      ).toResponse();
    }
  }

  const result = await saveUserSettings(session.user.id, {
    openclawGatewayUrl: nextGatewayUrl,
    openclawGatewayToken: nextGatewayToken,
    tamboApiKey: nextTamboApiKey,
  });

  return Response.json({
    success: true,
    settings: {
      openclawGatewayUrl: result?.openclawGatewayUrl ?? "",
      hasOpenclawGatewayToken: Boolean(result?.openclawGatewayToken),
      hasTamboApiKey: Boolean(result?.tamboApiKey),
      updatedAt: result?.updatedAt?.toISOString() ?? null,
    },
  });
}

import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getChannels, getConfig, updateChannel } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const [channels, config] = await Promise.all([
      getChannels(cfg),
      getConfig(cfg),
    ]);
    return Response.json({ channels, hash: config.hash });
  } catch (error) {
    console.error("GET /api/openclaw/channels failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    name: string;
    settings: Record<string, unknown>;
    hash: string;
  };

  if (!body.name || !body.hash) {
    return Response.json(
      { success: false, error: "Missing name or hash" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const result = await updateChannel(
      body.name,
      body.settings,
      body.hash,
      cfg
    );
    return Response.json(result);
  } catch (error) {
    console.error("PATCH /api/openclaw/channels failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
}

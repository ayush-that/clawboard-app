import { auth } from "@/app/(auth)/auth";
import { getChannels, getConfig, updateChannel } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export async function GET() {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const [channels, config] = await Promise.all([
    getChannels(cfg),
    getConfig(cfg),
  ]);
  return Response.json({ channels, hash: config.hash });
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
  const cfg = await getGatewayConfig(session?.user?.id);
  const result = await updateChannel(body.name, body.settings, body.hash, cfg);
  return Response.json(result);
}

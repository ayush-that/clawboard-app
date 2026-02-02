import { getChannels, getConfig, updateChannel } from "@/lib/openclaw/client";

export async function GET() {
  const [channels, config] = await Promise.all([getChannels(), getConfig()]);
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

  const result = await updateChannel(body.name, body.settings, body.hash);
  return Response.json(result);
}

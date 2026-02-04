import { auth } from "@/app/(auth)/auth";
import { getUserSettings, saveUserSettings } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getUserSettings(session.user.id);

  return Response.json({
    openclawGatewayUrl:
      settings?.openclawGatewayUrl || process.env.OPENCLAW_GATEWAY_URL || "",
    openclawGatewayToken: settings?.openclawGatewayToken || "",
    tamboApiKey: settings?.tamboApiKey || "",
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    openclawGatewayUrl?: string;
    openclawGatewayToken?: string;
    tamboApiKey?: string;
  };

  const result = await saveUserSettings(session.user.id, {
    openclawGatewayUrl: body.openclawGatewayUrl ?? null,
    openclawGatewayToken: body.openclawGatewayToken ?? null,
    tamboApiKey: body.tamboApiKey ?? null,
  });

  return Response.json({ success: true, settings: result });
}

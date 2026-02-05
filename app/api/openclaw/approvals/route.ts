import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getPendingApprovals, resolveApproval } from "@/lib/openclaw/client";
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
    const approvals = await getPendingApprovals(cfg);
    return Response.json(approvals);
  } catch (error) {
    return Response.json(
      { error: "Gateway unreachable", message: String(error) },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    id: string;
    action: "allow-once" | "allow-always" | "deny";
  };

  if (!body.id || !body.action) {
    return Response.json(
      { success: false, error: "Missing id or action" },
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
    const result = await resolveApproval(body.id, body.action, cfg);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Gateway unreachable", message: String(error) },
      { status: 502 }
    );
  }
}

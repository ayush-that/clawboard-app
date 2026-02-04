import { auth } from "@/app/(auth)/auth";
import { getPendingApprovals, resolveApproval } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export async function GET() {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const approvals = await getPendingApprovals(cfg);
  return Response.json(approvals);
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
  const cfg = await getGatewayConfig(session?.user?.id);
  const result = await resolveApproval(body.id, body.action, cfg);
  return Response.json(result);
}

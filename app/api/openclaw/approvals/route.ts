import { getPendingApprovals, resolveApproval } from "@/lib/openclaw/client";

export async function GET() {
  const approvals = await getPendingApprovals();
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

  const result = await resolveApproval(body.id, body.action);
  return Response.json(result);
}

import { auth } from "@/app/(auth)/auth";
import { getInstalledSkills } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const skills = await getInstalledSkills(cfg);
  return Response.json(skills);
};

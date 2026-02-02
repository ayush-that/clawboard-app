import { getSessionsList } from "@/lib/openclaw/client";

export const GET = async () => {
  const sessions = await getSessionsList();
  return Response.json(sessions);
};

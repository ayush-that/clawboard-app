import { getWebhookEvents } from "@/lib/openclaw/client";

export const GET = async () => {
  const events = await getWebhookEvents();
  return Response.json(events);
};

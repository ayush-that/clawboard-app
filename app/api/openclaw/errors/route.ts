import { getErrors } from "@/lib/openclaw/client";

export const GET = async () => {
  const errors = await getErrors();
  return Response.json(errors);
};

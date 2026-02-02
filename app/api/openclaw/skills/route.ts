import { getInstalledSkills } from "@/lib/openclaw/client";

export const GET = async () => {
  const skills = await getInstalledSkills();
  return Response.json(skills);
};

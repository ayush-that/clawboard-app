import { getCronJobs } from "@/lib/openclaw/client";

export const GET = async () => {
  const jobs = await getCronJobs();
  return Response.json(jobs);
};

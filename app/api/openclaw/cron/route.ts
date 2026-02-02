import type { NextRequest } from "next/server";
import {
  addCronJob,
  getCronJobs,
  removeCronJob,
  updateCronJob,
} from "@/lib/openclaw/client";

export const GET = async () => {
  const jobs = await getCronJobs();
  return Response.json(jobs);
};

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      name: string;
      schedule: string;
      message?: string;
    };
    const result = await addCronJob(body);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      id: string;
      name?: string;
      schedule?: string;
      message?: string;
      enabled?: boolean;
    };
    const { id, ...patch } = body;
    const result = await updateCronJob(id, patch);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as { id: string };
    const result = await removeCronJob(body.id);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};

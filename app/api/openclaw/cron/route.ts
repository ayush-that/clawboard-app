import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  addCronJob,
  getCronJobs,
  removeCronJob,
  updateCronJob,
} from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const jobs = await getCronJobs(cfg);
  return Response.json(jobs);
};

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      name: string;
      schedule: string;
      message?: string;
    };
    const session = await auth();
    const cfg = await getGatewayConfig(session?.user?.id);
    const result = await addCronJob(body, cfg);
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
    const session = await auth();
    const cfg = await getGatewayConfig(session?.user?.id);
    const result = await updateCronJob(id, patch, cfg);
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
    const session = await auth();
    const cfg = await getGatewayConfig(session?.user?.id);
    const result = await removeCronJob(body.id, cfg);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};

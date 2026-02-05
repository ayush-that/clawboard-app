import type { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import {
  addCronJob,
  getCronJobs,
  removeCronJob,
  updateCronJob,
} from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

const addCronSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().min(1),
  message: z.string().optional(),
});

const updateCronSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  schedule: z.string().min(1).optional(),
  message: z.string().optional(),
  enabled: z.boolean().optional(),
});

const deleteCronSchema = z.object({
  id: z.string().min(1),
});

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const jobs = await getCronJobs(cfg);
    return Response.json(jobs);
  } catch (error) {
    console.error("GET /api/openclaw/cron failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = addCronSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const result = await addCronJob(parsed.data, cfg);
    return Response.json(result);
  } catch (error) {
    console.error("POST /api/openclaw/cron failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = updateCronSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { id, ...patch } = parsed.data;
    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const result = await updateCronJob(id, patch, cfg);
    return Response.json(result);
  } catch (error) {
    console.error("PATCH /api/openclaw/cron failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = deleteCronSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const result = await removeCronJob(parsed.data.id, cfg);
    return Response.json(result);
  } catch (error) {
    console.error("DELETE /api/openclaw/cron failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

import { z } from "zod";

export const tamboTools = [
  {
    name: "getInstalledSkills",
    description:
      "List all installed OpenClaw skills and their status. Use when the user asks about capabilities, installed skills, what the agent can do, or integrations.",
    tool: async () => {
      const res = await fetch("/api/openclaw/skills");
      return res.json();
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        enabled: z.boolean(),
        lastUsed: z.string().optional(),
      })
    ),
  },
  {
    name: "queryMemory",
    description:
      "Search OpenClaw agent memory for stored context, facts, and knowledge. Use when the user asks what the agent remembers, stored information, or context about a topic.",
    tool: async ({ query }: { query: string }) => {
      const res = await fetch(
        `/api/openclaw/memory?q=${encodeURIComponent(query)}`
      );
      return res.json();
    },
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Search query to find relevant memories. Can be empty to get all."
        ),
    }),
    outputSchema: z.array(
      z.object({
        key: z.string(),
        summary: z.string(),
        timestamp: z.string(),
        relevance: z.number(),
      })
    ),
  },
  {
    name: "triggerWebhook",
    description:
      "Send a command to the OpenClaw agent via chat completions. Use when the user wants to tell the agent to do something, execute a task, or send a command.",
    tool: async ({ message }: { message: string }) => {
      const res = await fetch("/api/openclaw/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    inputSchema: z.object({
      message: z
        .string()
        .describe("The command or message to send to the agent"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      response: z.string(),
    }),
  },
  {
    name: "getCostData",
    description:
      "Fetch API cost and token usage data over time from session history. Use when the user asks about spending, costs, API usage, token consumption, or budget.",
    tool: async () => {
      const res = await fetch("/api/openclaw/costs");
      return res.json();
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        date: z.string(),
        tokens: z.number(),
        cost: z.number(),
        model: z.string(),
      })
    ),
  },
  {
    name: "getWebhookEvents",
    description:
      "Fetch recent webhook events and triggers. Use when the user asks about webhook activity, incoming events, or what triggered the agent.",
    tool: async () => {
      const res = await fetch("/api/openclaw/webhook-events");
      return res.json();
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        source: z.string(),
        payloadSummary: z.string(),
        timestamp: z.string(),
        actionTaken: z.string(),
      })
    ),
  },
  {
    name: "getErrors",
    description:
      "Fetch recent errors and issues from the agent. Use when the user asks about errors, failures, problems, or what went wrong.",
    tool: async () => {
      const res = await fetch("/api/openclaw/errors");
      return res.json();
    },
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        message: z.string(),
        skill: z.string(),
        timestamp: z.string(),
        severity: z.enum(["critical", "warning", "info"]),
        resolved: z.boolean(),
      })
    ),
  },
];

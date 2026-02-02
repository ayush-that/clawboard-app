import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { AgentStatus } from "@/components/generative/agent-status";
import { CodeBlock } from "@/components/generative/code-block";
import { CostChart } from "@/components/generative/cost-chart";
import { DataTable } from "@/components/generative/data-table";
import { ErrorReport } from "@/components/generative/error-report";
import { InfoCard } from "@/components/generative/info-card";
import { MarkdownCard } from "@/components/generative/markdown-card";
import { MemoryView } from "@/components/generative/memory-view";
import { ProConList } from "@/components/generative/pro-con-list";
import { SkillCard } from "@/components/generative/skill-card";
import { StepGuide } from "@/components/generative/step-guide";
import { TaskTimeline } from "@/components/generative/task-timeline";
import { WebhookLog } from "@/components/generative/webhook-log";

export const tamboComponents: TamboComponent[] = [
  // ── Agent-specific components ──────────────────────────────────
  {
    name: "AgentStatus",
    description:
      "Displays the current health and status of the OpenClaw agent. Use when the user asks about agent status, health check, uptime, how the agent is doing, or wants an overview.",
    component: AgentStatus,
    propsSchema: z.object({
      uptime: z
        .string()
        .describe("Human-readable uptime string like '3d 14h 22m'"),
      model: z
        .string()
        .describe(
          "The AI model the agent is currently using, e.g. 'claude-sonnet-4-5-20250929'"
        ),
      tokensToday: z
        .number()
        .describe("Total tokens consumed today as a number"),
      costToday: z
        .number()
        .describe("Total API cost today in USD as a decimal number"),
      activeChannels: z
        .array(z.string())
        .describe(
          "List of active communication channels like 'telegram', 'slack', 'webhook'"
        ),
      lastActivity: z
        .string()
        .describe("ISO 8601 timestamp of the agent's most recent activity"),
      status: z
        .enum(["online", "offline", "degraded"])
        .describe("Current agent status"),
    }),
  },
  {
    name: "TaskTimeline",
    description:
      "Shows a timeline of recent task executions with status indicators. Use when the user asks about recent activity, what happened overnight, task history, what the agent has been doing, or job executions.",
    component: TaskTimeline,
    propsSchema: z.object({
      tasks: z
        .array(
          z.object({
            name: z.string().describe("Name of the task that ran"),
            status: z
              .enum(["success", "failed", "running"])
              .describe("Current status of the task"),
            startedAt: z
              .string()
              .describe("ISO 8601 timestamp when the task started"),
            duration: z
              .number()
              .describe("Duration in milliseconds. 0 if still running."),
            result: z
              .string()
              .optional()
              .describe("Human-readable result summary"),
          })
        )
        .describe("Array of task execution records"),
      timeRange: z
        .enum(["1h", "6h", "24h", "7d"])
        .describe("Time range filter. Default to '24h' unless user specifies."),
    }),
  },
  {
    name: "CostChart",
    description:
      "Displays API cost and token usage over time as a chart. Use when the user asks about spending, costs, API usage, token consumption, budget, or cost breakdown.",
    component: CostChart,
    propsSchema: z.object({
      data: z
        .array(
          z.object({
            date: z.string().describe("Date string in YYYY-MM-DD format"),
            tokens: z.number().describe("Number of tokens used on this date"),
            cost: z.number().describe("Cost in USD for this date"),
            model: z.string().describe("Model used on this date"),
          })
        )
        .describe("Array of daily cost data points"),
      chartType: z
        .enum(["line", "bar"])
        .describe(
          "Chart visualization type. Use 'line' for trends, 'bar' for comparisons."
        ),
    }),
  },
  {
    name: "SkillCard",
    description:
      "Shows a grid of installed skills with their status. Use when the user asks about capabilities, installed skills, what the agent can do, integrations, or available tools.",
    component: SkillCard,
    propsSchema: z.object({
      skills: z
        .array(
          z.object({
            name: z.string().describe("Skill name identifier"),
            description: z
              .string()
              .describe("Brief description of what the skill does"),
            enabled: z
              .boolean()
              .describe("Whether the skill is currently active"),
            lastUsed: z
              .string()
              .optional()
              .describe("ISO 8601 timestamp of last usage"),
          })
        )
        .describe("Array of installed skills"),
    }),
  },
  {
    name: "MemoryView",
    description:
      "Displays agent memory entries with relevance scores. Use when the user asks what the agent remembers, stored context, knowledge, or wants to search the agent's memory.",
    component: MemoryView,
    propsSchema: z.object({
      memories: z
        .array(
          z.object({
            key: z.string().describe("Memory entry identifier/key"),
            summary: z
              .string()
              .describe("Human-readable summary of the memory"),
            timestamp: z
              .string()
              .describe("ISO 8601 timestamp when memory was stored"),
            relevance: z.number().describe("Relevance score between 0 and 1"),
          })
        )
        .describe("Array of memory entries"),
      query: z
        .string()
        .describe(
          "The search query used to find these memories, or empty string"
        ),
    }),
  },
  {
    name: "WebhookLog",
    description:
      "Shows a log of recent webhook events and triggers. Use when the user asks about webhook activity, incoming events, triggers, or what events were received.",
    component: WebhookLog,
    propsSchema: z.object({
      events: z
        .array(
          z.object({
            source: z
              .string()
              .describe("Source of the event like 'github', 'slack', 'cron'"),
            payloadSummary: z
              .string()
              .describe("Brief summary of the event payload"),
            timestamp: z.string().describe("ISO 8601 timestamp of the event"),
            actionTaken: z
              .string()
              .describe("What the agent did in response to the event"),
          })
        )
        .describe("Array of webhook event records"),
    }),
  },
  {
    name: "ErrorReport",
    description:
      "Shows recent errors and issues with severity levels. Use when the user asks about errors, failures, problems, what went wrong, or issues with the agent.",
    component: ErrorReport,
    propsSchema: z.object({
      errors: z
        .array(
          z.object({
            message: z.string().describe("Error message text"),
            skill: z.string().describe("Which skill produced the error"),
            timestamp: z.string().describe("ISO 8601 timestamp of the error"),
            severity: z
              .enum(["critical", "warning", "info"])
              .describe("Severity level of the error"),
            resolved: z
              .boolean()
              .describe("Whether this error has been resolved"),
          })
        )
        .describe("Array of error records"),
    }),
  },

  // ── General-purpose components ─────────────────────────────────
  {
    name: "MarkdownCard",
    description:
      "Renders rich formatted text with sections and headings. Use for ANY general knowledge question, explanation, essay, summary, analysis, definition, or long-form answer that is NOT code, NOT a comparison, NOT step-by-step instructions, and NOT tabular data. This is the DEFAULT component for general questions.",
    component: MarkdownCard,
    propsSchema: z.object({
      title: z.string().describe("Title of the response"),
      sections: z
        .array(
          z.object({
            heading: z
              .string()
              .optional()
              .describe("Section heading, omit for intro paragraphs"),
            content: z
              .string()
              .describe(
                "Section body text. Use line breaks for paragraphs. Keep it informative and well-structured."
              ),
          })
        )
        .describe("Array of content sections"),
      category: z
        .string()
        .optional()
        .describe(
          "Category tag like 'explanation', 'summary', 'essay', 'analysis', 'definition', 'history', 'science', 'culture'"
        ),
    }),
  },
  {
    name: "CodeBlock",
    description:
      "Displays syntax-highlighted code with a copy button. Use when the user asks for code, a code example, algorithm implementation, script, snippet, programming help, or anything involving writing code.",
    component: CodeBlock,
    propsSchema: z.object({
      code: z.string().describe("The code content to display"),
      language: z
        .string()
        .describe(
          "Programming language for syntax context, e.g. 'javascript', 'python', 'rust', 'sql', 'bash', 'html', 'css', 'go', 'java'"
        ),
      filename: z
        .string()
        .optional()
        .describe(
          "Optional filename like 'index.ts' or 'main.py' shown in the header"
        ),
      description: z
        .string()
        .optional()
        .describe("Brief description of what the code does"),
    }),
  },
  {
    name: "DataTable",
    description:
      "Renders structured data in a table with headers and rows. Use when the user asks for a comparison table, list of items with multiple attributes, rankings, statistics, structured data, or any information best shown in tabular format.",
    component: DataTable,
    propsSchema: z.object({
      title: z.string().describe("Table title"),
      headers: z
        .array(z.string())
        .describe("Column header names, e.g. ['Name', 'Language', 'Stars']"),
      rows: z
        .array(z.array(z.string()))
        .describe(
          "Array of rows, each row is an array of cell values matching the headers"
        ),
      caption: z
        .string()
        .optional()
        .describe("Optional caption or source note below the title"),
    }),
  },
  {
    name: "StepGuide",
    description:
      "Shows a numbered step-by-step guide with a visual timeline. Use when the user asks how to do something, wants a tutorial, recipe, setup instructions, workflow, process guide, or any sequential instructions.",
    component: StepGuide,
    propsSchema: z.object({
      title: z.string().describe("Guide title, e.g. 'How to Deploy to Vercel'"),
      steps: z
        .array(
          z.object({
            title: z.string().describe("Short step title"),
            description: z
              .string()
              .describe("Detailed description of what to do in this step"),
          })
        )
        .describe("Array of steps in order"),
      difficulty: z
        .string()
        .optional()
        .describe(
          "Difficulty level: 'beginner', 'intermediate', or 'advanced'"
        ),
    }),
  },
  {
    name: "ProConList",
    description:
      "Shows a pros and cons comparison with a verdict. Use when the user asks to compare two options, evaluate pros and cons, asks 'should I use X or Y?', wants advantages/disadvantages, or needs help making a decision.",
    component: ProConList,
    propsSchema: z.object({
      title: z
        .string()
        .describe(
          "What is being evaluated, e.g. 'React vs Vue' or 'Remote Work'"
        ),
      pros: z
        .array(
          z.object({
            point: z.string().describe("Pro point"),
            detail: z
              .string()
              .optional()
              .describe("Additional detail or context"),
          })
        )
        .describe("Array of advantages/pros"),
      cons: z
        .array(
          z.object({
            point: z.string().describe("Con point"),
            detail: z
              .string()
              .optional()
              .describe("Additional detail or context"),
          })
        )
        .describe("Array of disadvantages/cons"),
      verdict: z
        .string()
        .optional()
        .describe("Overall verdict or recommendation"),
    }),
  },
  {
    name: "InfoCard",
    description:
      "Displays a quick info card with key details. Use when the user asks for a quick fact, definition, 'what is X?', brief overview of a concept, person, place, technology, or any quick-reference lookup with key-value details.",
    component: InfoCard,
    propsSchema: z.object({
      title: z.string().describe("Subject name"),
      description: z
        .string()
        .describe("Brief description or definition, 1-3 sentences"),
      details: z
        .array(
          z.object({
            label: z
              .string()
              .describe("Detail label like 'Created', 'Type', 'Used for'"),
            value: z.string().describe("Detail value"),
          })
        )
        .describe("Array of key-value detail pairs"),
      category: z
        .string()
        .optional()
        .describe(
          "Category tag like 'technology', 'person', 'concept', 'language', 'framework', 'science'"
        ),
    }),
  },
];

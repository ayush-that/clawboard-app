const PRIMARY_PATTERNS: RegExp[] = [
  /\b(cost|costs|spend|spending|usage|tokens?|budget)\b/i,
  /\b(skill|skills|capabilit(?:y|ies)|integrations?)\b/i,
  /\b(memory|remembered|recall|context)\b/i,
  /\b(webhook|event|events|trigger|triggers)\b/i,
  /\b(error|errors|failure|failures|issue|issues|incident|incidents)\b/i,
  /\b(chart|graph|table|timeline|dashboard|report|breakdown|trend|metrics?)\b/i,
];

const ACTION_PATTERNS: RegExp[] = [
  /\b(show|display|visualize|plot|summarize|compare|analyze|list)\b/i,
];

const DATA_NOUN_PATTERNS: RegExp[] = [
  /\b(activity|sessions?|logs?|costs?|usage|skills?|memory|errors?|webhooks?)\b/i,
];

export function shouldRenderTamboForMessage(message: string): boolean {
  const normalized = message.trim();

  if (normalized.length < 4) {
    return false;
  }

  if (PRIMARY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  const hasActionIntent = ACTION_PATTERNS.some((pattern) =>
    pattern.test(normalized)
  );
  const hasDashboardNoun = DATA_NOUN_PATTERNS.some((pattern) =>
    pattern.test(normalized)
  );

  return hasActionIntent && hasDashboardNoun;
}

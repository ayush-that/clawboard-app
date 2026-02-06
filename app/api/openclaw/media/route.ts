import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getGatewayConfig } from "@/lib/openclaw/settings";

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

const EXTENSION_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * The OpenClaw workspace root on the gateway VPS.
 * Files are served via a static file server exposed at /ocmedia/ on the
 * gateway hostname. Set up with:
 *   cd ~/.openclaw && python3 -m http.server 42880 --bind 127.0.0.1 &
 *   sudo tailscale serve --bg --set-path /ocmedia http://127.0.0.1:42880
 */
const OPENCLAW_ROOT = "/home/ubuntu/.openclaw/";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");
  if (!filePath) {
    return Response.json({ error: "Missing path parameter" }, { status: 400 });
  }

  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  // Derive the base URL (strip /v1 if present, strip trailing slash)
  const baseUrl = cfg.gatewayUrl.replace(/\/v1\/?$/, "").replace(/\/+$/, "");

  // Build the file server URL by stripping the OpenClaw root prefix
  const relativePath = filePath.startsWith(OPENCLAW_ROOT)
    ? filePath.slice(OPENCLAW_ROOT.length)
    : filePath.replace(/^\//, "");
  const fileUrl = `${baseUrl}/ocmedia/${encodeURI(relativePath)}`;

  const reqHeaders: Record<string, string> = {};
  if (cfg.gatewayToken) {
    reqHeaders.Authorization = `Bearer ${cfg.gatewayToken}`;
  }

  try {
    const response = await fetch(fileUrl, {
      headers: reqHeaders,
      signal: AbortSignal.timeout(30_000),
    });

    const contentType = response.headers.get("content-type") || "";

    // HTML response means /ocmedia fell through to the Control UI catch-all
    if (contentType.includes("text/html")) {
      return Response.json(
        {
          error: "File server not configured on gateway VPS",
          hint: "Run on VPS: cd ~/.openclaw && python3 -m http.server 42880 --bind 127.0.0.1 & sudo tailscale serve --bg --set-path /ocmedia http://127.0.0.1:42880",
          tried: fileUrl,
        },
        { status: 502 }
      );
    }

    // File genuinely not found (image may still be generating)
    if (!response.ok) {
      return Response.json(
        { error: "File not found", tried: fileUrl, status: response.status },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      return Response.json({ error: "Empty file" }, { status: 404 });
    }

    const mime =
      EXTENSION_MIME[ext] || contentType || "application/octet-stream";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[media] fetch failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
}

export const GET = () => {
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      // Send connection confirmation
      const initial = `data: ${JSON.stringify({
        type: "connected",
        data: "SSE stream connected to ClawBoard",
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initial));

      // Keep-alive ping every 30 seconds
      interval = setInterval(() => {
        const ping = `data: ${JSON.stringify({
          type: "ping",
          data: "keep-alive",
          timestamp: new Date().toISOString(),
        })}\n\n`;
        controller.enqueue(encoder.encode(ping));
      }, 30_000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

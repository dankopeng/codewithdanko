import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server"; // eslint-disable-line import/no-unresolved
import { getLoadContext } from "./load-context";

declare global {
  interface Env {
    COOKIE_DOMAIN: string;
    SESSION_MAX_AGE: string;
    UPLOAD_MAX_BYTES: string;
    API: Fetcher;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

export default {
  async fetch(request, env, ctx) {
    const { pathname, search } = new URL(request.url);
    if (pathname.startsWith("/api/")) {
      // Build a Request for the service binding (host is ignored by bindings)
      // 保持原始路径，因为后端 API 也使用 /api/ 前缀
      const url = new URL(pathname + search, "https://api.internal");
      const headers = new Headers(request.headers);
      headers.delete("host");
      // Add trace ID for debugging
      const traceId = crypto.randomUUID().slice(0, 8);
      headers.set("x-trace-id", traceId);
      const init: RequestInit = {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
        redirect: "manual",
      };
      // TEMP LOG: trace proxy calls
      try {
        console.log(`[WEB:${traceId}] proxy -> ${request.method} ${pathname} to API worker`);
      } catch {}
      const proxied = new Request(url.toString(), init);
      try {
        const apiResponse = await env.API.fetch(proxied);
        console.log(`[WEB:${traceId}] proxy <- ${apiResponse.status} from API worker`);
        return apiResponse;
      } catch (error) {
        console.error(`[WEB:${traceId}] API proxy error:`, error);
        return new Response(JSON.stringify({ 
          error: "api_connection_error", 
          message: "Could not connect to API service" 
        }), { 
          status: 502, 
          headers: { "Content-Type": "application/json" } 
        });
      }
    }
    try {
      const loadContext = getLoadContext({
        request,
        context: {
          cloudflare: {
            // This object matches the return value from Wrangler's
            // `getPlatformProxy` used during development via Remix's
            // `cloudflareDevProxyVitePlugin`:
            // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
            cf: request.cf,
            ctx,
            caches,
            env,
          },
        },
      });
      return await handleRemixRequest(request, loadContext);
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

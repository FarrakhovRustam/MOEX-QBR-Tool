import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (request) => {
  const origin = Deno.env.get("WEB_ASSET_ORIGIN");
  if (!origin) return new Response("WEB_ASSET_ORIGIN is not configured", { status: 503 });
  const url = new URL(request.url);
  const assetUrl = new URL(url.pathname === "/" ? "/index.html" : url.pathname, origin);
  let response = await fetch(assetUrl);
  if (response.status === 404) response = await fetch(new URL("/index.html", origin));
  const headers = new Headers(response.headers);
  headers.set("cache-control", url.pathname.includes(".") ? "public, max-age=31536000, immutable" : "no-cache");
  return new Response(response.body, { status: response.status, headers });
});

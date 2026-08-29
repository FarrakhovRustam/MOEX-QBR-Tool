import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type" };

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    try {
      const { periodId } = await req.json();
      const { data: snapshot, error } = await ctx.supabase.rpc("get_qbr_ai_snapshot", { p_period_id: periodId });
      if (error) throw error;
      const model = Deno.env.get("AI_MODEL") ?? "openai/gpt-4.1-mini";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`, "Content-Type": "application/json", "HTTP-Referer": Deno.env.get("SUPABASE_URL")!, "X-Title": "MOEX QBR Tool" },
        body: JSON.stringify({ model, response_format: { type: "json_object" }, messages: [
          { role: "system", content: "Ты аналитик QBR. Верни JSON с ключами executive_summary, achievements, deviations, risks, decisions_needed, recommendations. Не выдумывай факты." },
          { role: "user", content: JSON.stringify(snapshot) },
        ] }),
      });
      if (!response.ok) throw new Error(`OpenRouter: ${response.status}`);
      const completion = await response.json();
      const result = JSON.parse(completion.choices?.[0]?.message?.content ?? "{}");
      const input = new TextEncoder().encode(JSON.stringify(snapshot));
      const inputHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", input))).map((b) => b.toString(16).padStart(2, "0")).join("");
      const { error: saveError } = await ctx.supabase.from("ai_analyses").insert({ qbr_period_id: periodId, analysis_type: "review", model, input_hash: inputHash, result, created_by: ctx.userClaims.sub });
      if (saveError) throw saveError;
      return Response.json({ result }, { headers: cors });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "AI analysis failed" }, { status: 500, headers: cors });
    }
  }),
};

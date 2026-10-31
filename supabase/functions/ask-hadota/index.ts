// Supabase Edge Function: Ask Hadota (Egyptian Arabic LLM behind a server-side key).
// Deploy:  supabase functions deploy ask-hadota
// Secrets: supabase secrets set LLM_URL=https://<provider>/v1/chat/completions LLM_KEY=<key> LLM_MODEL=<model id>
// Any OpenAI-compatible endpoint works (Nile-Chat-4B if your provider hosts it, otherwise ALLaM / Jais / another Arabic model).
// If the secrets are missing or the call fails it returns {text:""} and the app falls back to its rule-based answers.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...cors, "Content-Type": "application/json" } });
const SYS = "أنت حدوتة، باريستا مصري ودود بيتكلم بالعامية المصرية. بتساعد مدمني القهوة في البن والتحميص والطحن والتحويجة وطرق التحضير. رد في ٣ جمل بالكتير. متديش نصايح طبية، ومتطلبش بيانات شخصية، ولو السؤال مش عن القهوة رجّع الكلام بلطف للقهوة.";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { q, ctx } = await req.json();
    const url = Deno.env.get("LLM_URL"), key = Deno.env.get("LLM_KEY"), model = Deno.env.get("LLM_MODEL");
    const question = String(q || "").slice(0, 300);
    if (!url || !key || !model || !question) return json({ text: "" });
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model, max_tokens: 220, temperature: 0.5, messages: [
        { role: "system", content: SYS },
        { role: "user", content: (ctx ? "آخر خلطة: " + String(ctx).slice(0, 200) + "\n" : "") + question },
      ] }),
    });
    const d = await r.json();
    return json({ text: String(d?.choices?.[0]?.message?.content || "").trim().slice(0, 600) });
  } catch (_) { return json({ text: "" }); }
});

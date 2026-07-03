// supabase/functions/ai-chat/index.ts
//
// This runs on Supabase's servers, NOT in the browser — so your real AI API
// key stays secret. The browser calls this function; this function calls
// the AI provider and returns just the reply text.
//
// Deploy with:   supabase functions deploy ai-chat
// Set secret:    supabase secrets set AI_API_KEY=sk-...
//
// Works with Anthropic (Claude) by default. To use OpenAI instead, see the
// commented OPENAI block below and swap which one is active.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are SVG, a wise, patient, encouraging lion AI tutor for the
StudySphere study platform. Help students with explanations, step-by-step math/science
solutions, quizzes, flashcards, and study summaries. Keep replies clear, encouraging, and
not too long (a few short paragraphs or a tight list) unless the student asks for more detail.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI_API_KEY secret is not set on the server" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- ANTHROPIC (Claude) — active by default ----------
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(JSON.stringify({ error: `AI provider error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await anthropicRes.json();
    const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a reply just now.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // ---------- OPENAI — use this block instead if you prefer OpenAI ----------
    // Comment out the ANTHROPIC block above and uncomment this one.
    //
    // const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-4o-mini",
    //     messages: [
    //       { role: "system", content: SYSTEM_PROMPT },
    //       ...messages.map((m: { role: string; content: string }) => ({
    //         role: m.role === "assistant" ? "assistant" : "user",
    //         content: m.content,
    //       })),
    //     ],
    //     max_tokens: 600,
    //   }),
    // });
    // const data = await openaiRes.json();
    // const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply just now.";
    // return new Response(JSON.stringify({ reply }), {
    //   headers: { ...corsHeaders, "Content-Type": "application/json" },
    // });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

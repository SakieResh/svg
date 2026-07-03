// ===================== StudySphere configuration =====================
// Fill these in after you create your free Supabase project.
// See SETUP.md for step-by-step instructions.

const STUDYSPHERE_CONFIG = {
  // Project Settings -> API -> Project URL
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",

  // Project Settings -> API -> anon / public key
  // This key is SAFE to put in client-side code — it only allows what your
  // Supabase Row Level Security rules permit. Never put your "service_role" key here.
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",

  // The URL of the Edge Function that proxies AI chat requests (keeps your
  // real AI API key secret on the server). After deploying the function in
  // supabase/functions/ai-chat, this will look like:
  // https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-chat
  AI_CHAT_ENDPOINT: "YOUR_SUPABASE_PROJECT_URL/functions/v1/ai-chat",
};

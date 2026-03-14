import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUGGING: Let's see exactly what Vercel injected into the build
console.log("--- SUPABASE CONFIG DEBUG ---");
console.log("URL exists:", !!supabaseUrl);
console.log("Anon Key exists:", !!supabaseAnonKey);
if (supabaseAnonKey) {
  console.log("Anon Key Length:", supabaseAnonKey.length);
  console.log("Starts with:", supabaseAnonKey.substring(0, 5));
  console.log("Ends with:", supabaseAnonKey.substring(supabaseAnonKey.length - 5));
  console.log("Contains quotes?", supabaseAnonKey.includes('"') || supabaseAnonKey.includes("'"));
}
console.log("-----------------------------");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { createClient } = require("@supabase/supabase-js");

// Use service role key to bypass RLS on the backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

module.exports = supabase;

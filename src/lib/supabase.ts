import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ayykpbgsmmcltcjmqckx.supabase.co";
const supabaseKey =
  "sb_publishable_HZ3-UcpD6PP4sMg7myDMEw_vyR7Q-4M";

export const supabase = createClient(supabaseUrl, supabaseKey);

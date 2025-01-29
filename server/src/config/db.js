import { createClient } from "@supabase/supabase-js";

const supabase_url = ''
const supabase_key = ''

const supabase = createClient(supabase_url, supabase_key);

export default supabase;
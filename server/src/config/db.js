import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_TOKEN);

export default supabase;

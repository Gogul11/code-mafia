import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';


// Create a single supabase client for interacting with your database
// In your supabase.js file
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  async function testConnection() {
    
    const { error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  }
  
  testConnection();
  
  export default supabase;
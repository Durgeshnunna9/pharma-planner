// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ryqzwdnlviyjtdxvuquk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cXp3ZG5sdml5anRkeHZ1cXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzQ1OTIsImV4cCI6MjA2NTgxMDU5Mn0.t0n8FZqXIoDFQIN1tdXS82SrZCuv05xQQMaYaO0Aixk";

export const supabase = createClient(supabaseUrl, supabaseKey);

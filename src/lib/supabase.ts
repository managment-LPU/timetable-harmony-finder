
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdvohkrsqulttvhowyfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkdm9oa3JzcXVsdHR2aG93eWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDQwNzcsImV4cCI6MjA1ODgyMDA3N30.h8kVmK_yQDr6EErI9kFwlfKY0HbC-8bWMkDFXlGfksA';

export const supabase = createClient(supabaseUrl, supabaseKey);

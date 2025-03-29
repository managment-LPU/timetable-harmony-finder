
import { supabase } from './supabase';

// Function to create tables if they don't exist
export const initializeSupabase = async () => {
  try {
    // Check if the students table exists
    const { error: checkError } = await supabase
      .from('students')
      .select('count()', { count: 'exact', head: true });

    // If the table doesn't exist, create it
    if (checkError && checkError.code === '42P01') {
      const createQuery = `
        CREATE TABLE IF NOT EXISTS public.students (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name TEXT NOT NULL,
          reg_no TEXT NOT NULL,
          roll_no TEXT NOT NULL,
          schedule JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec', { query: createQuery });
      
      if (createError) {
        console.error("Failed to create students table:", createError);
        
        // Alternative approach using SQL directly
        const sqlQuery = `
          BEGIN;
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          CREATE TABLE IF NOT EXISTS public.students (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            reg_no TEXT NOT NULL,
            roll_no TEXT NOT NULL,
            schedule JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
          );
          COMMIT;
        `;
        
        const { error } = await supabase.rpc('exec', { query: sqlQuery });
        if (error) console.error("Error creating tables:", error);
      }
    }
    
    console.log("Supabase initialization complete");
    return true;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    return false;
  }
};

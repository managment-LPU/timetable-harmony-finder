
import { supabase } from './supabase';
import { Student } from './types';

// Initialize the database by creating required tables if they don't exist
export const initializeDatabase = async () => {
  try {
    // Create students table if it doesn't exist
    const { error } = await supabase.rpc('create_students_table');
    
    if (error && error.message !== 'function "create_students_table" does not exist') {
      console.error("Error initializing database:", error);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
};

// Save student data to Supabase
export const saveStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        name: student.name,
        reg_no: student.regNo,
        roll_no: student.rollNo,
        schedule: student.schedule
      }])
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error saving student:", error);
    return { success: false, error };
  }
};

// Get all students from Supabase
export const getStudents = async () => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to match our Student type
    const transformedData = data.map((item: any): Student => ({
      id: item.id,
      name: item.name,
      regNo: item.reg_no,
      rollNo: item.roll_no,
      schedule: item.schedule,
      createdAt: item.created_at
    }));
    
    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error };
  }
};

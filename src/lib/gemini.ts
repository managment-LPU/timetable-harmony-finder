
import { HOURS } from "./constants";
import { Student, CommonSlot } from "./types";

export async function analyzeTimeSlots(students: Student[]): Promise<{commonSlots: CommonSlot[], aiSummary: string}> {
  try {
    if (students.length === 0) {
      return { commonSlots: [], aiSummary: "No students data available for analysis." };
    }

    // First calculate common slots without AI
    const commonSlots: CommonSlot[] = [];
    
    students[0].schedule.forEach(daySchedule => {
      const day = daySchedule.day;
      
      daySchedule.slots.forEach((slot, hourIndex) => {
        // Check if this slot is free for all students
        const isCommonFree = students.every(student => {
          const studentDay = student.schedule.find(d => d.day === day);
          return studentDay?.slots[hourIndex]?.isSelected === true;
        });

        if (isCommonFree) {
          commonSlots.push({
            day,
            hour: hourIndex,
            students: students.map(s => s.name)
          });
        }
      });
    });

    // Prepare data for Gemini API
    const studentData = students.map(student => ({
      name: student.name,
      schedule: student.schedule.map(day => ({
        day: day.day,
        freeSlots: day.slots
          .map((slot, idx) => slot.isSelected ? HOURS[idx] : null)
          .filter(Boolean)
      }))
    }));

    const commonSlotsFormatted = commonSlots.map(slot => ({
      day: slot.day,
      time: HOURS[slot.hour]
    }));

    // Prompt for Gemini API
    const prompt = `
      Analyze the following student timetable data and provide insights:
      
      Student Schedules:
      ${JSON.stringify(studentData, null, 2)}
      
      Common Free Slots Found:
      ${JSON.stringify(commonSlotsFormatted, null, 2)}
      
      Please provide:
      1. A concise summary of the common free slots
      2. Recommendations for the best meeting times based on the data
      3. Any patterns you notice in the students' availability
      
      Respond in a concise, helpful format suitable for a timetable coordination system.
    `;

    // Use a secure proxy endpoint to call Gemini API
    try {
      // First try to use server proxy endpoint
      const response = await fetch("/api/generate-ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          commonSlots,
          aiSummary: data.aiSummary || "AI analysis completed successfully."
        };
      } 
      throw new Error("Server-side proxy unavailable");
    } catch (proxyError) {
      console.warn("Server proxy failed, falling back to direct client-side call:", proxyError);
      
      // Fallback: Add explicit warning about insecure implementation
      console.warn("WARNING: Using fallback direct API call method. This is less secure and should be replaced with server-side implementation in production.");
      
      // Fallback to direct call with limited functionality
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDrQxBtRcL5yMU5aP9lr7vpLrLHR8CiQ10", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      let aiSummary = "Unable to generate AI analysis at this time.";
      
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        aiSummary = data.candidates[0].content.parts[0].text;
      }

      return {
        commonSlots,
        aiSummary
      };
    }
  } catch (error) {
    console.error("Error analyzing time slots:", error);
    return {
      commonSlots: [],
      aiSummary: "An error occurred while analyzing the time slots."
    };
  }
}

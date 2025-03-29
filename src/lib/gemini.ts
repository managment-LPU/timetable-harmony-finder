
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

    // Call Gemini API
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCC9ztiIqh1ZEgad91zwh1230OVvDibS0Q", {
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
  } catch (error) {
    console.error("Error analyzing time slots:", error);
    return {
      commonSlots: [],
      aiSummary: "An error occurred while analyzing the time slots."
    };
  }
}

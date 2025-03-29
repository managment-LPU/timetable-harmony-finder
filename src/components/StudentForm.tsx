import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student, DaySchedule, TimeSlot } from '@/lib/types';
import { DAYS_OF_WEEK, HOURS } from '@/lib/constants';
import { saveStudent } from '@/lib/db';
import { Check, Loader2, User, Hash, BookOpen } from 'lucide-react';

const StudentForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("monday");
  
  const initialSchedule: DaySchedule[] = DAYS_OF_WEEK.map(day => ({
    day,
    slots: HOURS.map((_, idx) => ({ hour: idx, isSelected: false }))
  }));

  const [student, setStudent] = useState<Student>({
    name: '',
    regNo: '',
    rollNo: '',
    schedule: initialSchedule
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    regNo: false,
    rollNo: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
    
    if (value.trim()) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSlotToggle = (dayIndex: number, slotIndex: number) => {
    setStudent(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        slots: newSchedule[dayIndex].slots.map((slot, idx) => 
          idx === slotIndex ? { ...slot, isSelected: !slot.isSelected } : slot
        )
      };
      return { ...prev, schedule: newSchedule };
    });
  };

  const validateForm = () => {
    const errors = {
      name: !student.name.trim(),
      regNo: !student.regNo.trim(),
      rollNo: !student.rollNo.trim()
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await saveStudent({
        name: student.name,
        regNo: student.regNo,
        rollNo: student.rollNo,
        schedule: student.schedule
      });
      
      if (!result.success) throw new Error("Failed to save student data");
      
      toast({
        title: "Submission Successful",
        description: "Your timetable information has been saved.",
      });
      
      setStudent({
        name: '',
        regNo: '',
        rollNo: '',
        schedule: initialSchedule
      });
      
      navigate('/admin');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving your information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Timetable Harmony Finder</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Please provide your details so we can identify your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User size={16} />
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={student.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regNo" className="flex items-center gap-2">
                <BookOpen size={16} />
                Registration Number
              </Label>
              <Input
                id="regNo"
                name="regNo"
                value={student.regNo}
                onChange={handleInputChange}
                placeholder="Enter your registration number"
                className={formErrors.regNo ? "border-red-500" : ""}
              />
              {formErrors.regNo && <p className="text-red-500 text-sm">Registration number is required</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rollNo" className="flex items-center gap-2">
                <Hash size={16} />
                Roll Number
              </Label>
              <Input
                id="rollNo"
                name="rollNo"
                value={student.rollNo}
                onChange={handleInputChange}
                placeholder="Enter your roll number"
                className={formErrors.rollNo ? "border-red-500" : ""}
              />
              {formErrors.rollNo && <p className="text-red-500 text-sm">Roll number is required</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Timetable Information</CardTitle>
          <CardDescription>
            Select your free time slots for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
              {DAYS_OF_WEEK.map((day, index) => (
                <TabsTrigger key={day} value={day.toLowerCase()}>
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <TabsContent key={day} value={day.toLowerCase()}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {HOURS.map((hour, hourIndex) => (
                      <div 
                        key={`${day}-${hourIndex}`} 
                        className={`flex items-center space-x-2 p-3 rounded-md border ${
                          student.schedule[dayIndex].slots[hourIndex].isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border"
                        }`}
                      >
                        <Checkbox 
                          id={`${day}-${hourIndex}`}
                          checked={student.schedule[dayIndex].slots[hourIndex].isSelected}
                          onCheckedChange={() => handleSlotToggle(dayIndex, hourIndex)}
                        />
                        <Label 
                          htmlFor={`${day}-${hourIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {hour}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Timetable"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default StudentForm;

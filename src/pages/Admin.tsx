import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DAYS_OF_WEEK, HOURS } from '@/lib/constants';
import { Student, AnalysisResult, CommonSlot } from '@/lib/types';
import { analyzeTimeSlots } from '@/lib/gemini';
import { getStudents } from '@/lib/db';
import { RefreshCw, Users, Clock, FileText, Loader2 } from 'lucide-react';

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState("summary");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    commonSlots: [],
    aiSummary: "",
    lastUpdated: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch students data on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const result = await getStudents();
      
      if (!result.success) throw new Error("Failed to fetch students");
      
      setStudents(result.data);
      
      // If we have students, run the analysis
      if (result.data.length > 0) {
        runAnalysis(result.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async (studentData: Student[] = students) => {
    if (studentData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "There are no students to analyze.",
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTimeSlots(studentData);
      
      setAnalysisResult({
        commonSlots: result.commonSlots,
        aiSummary: result.aiSummary,
        lastUpdated: new Date().toLocaleString()
      });
      
      toast({
        title: "Analysis Complete",
        description: "The timetable analysis has been updated.",
      });
    } catch (error) {
      console.error("Error running analysis:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing the timetables.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCommonSlotsForDay = (day: string): CommonSlot[] => {
    return analysisResult.commonSlots.filter(slot => slot.day === day);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage students and analyze timetables for common free slots
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={fetchStudents}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => runAnalysis()}
            disabled={isAnalyzing || students.length === 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> 
                Timetable Analysis
              </CardTitle>
              <CardDescription>
                {analysisResult.lastUpdated 
                  ? `Last updated: ${analysisResult.lastUpdated}` 
                  : "No analysis has been run yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-7">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  {DAYS_OF_WEEK.map(day => (
                    <TabsTrigger key={day} value={day.toLowerCase()}>
                      {day.substring(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="summary" className="mt-4">
                  {analysisResult.aiSummary ? (
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line">{analysisResult.aiSummary}</div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No analysis data available yet.</p>
                      <p>Run an analysis to see the AI-powered summary.</p>
                    </div>
                  )}
                </TabsContent>
                
                {DAYS_OF_WEEK.map(day => (
                  <TabsContent key={day} value={day.toLowerCase()} className="mt-4">
                    <h3 className="text-xl font-semibold mb-4">{day} Common Free Slots</h3>
                    
                    {getCommonSlotsForDay(day).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getCommonSlotsForDay(day).map((slot, index) => (
                          <Card key={`${day}-${slot.hour}`} className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                              <div className="text-xl font-medium mb-2 text-primary">
                                {HOURS[slot.hour]}
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                {slot.students.length} student{slot.students.length !== 1 ? 's' : ''} available
                              </div>
                              <div className="text-sm">
                                <strong>Students:</strong> {slot.students.join(", ")}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No common free slots found for {day}.</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> 
                Students ({students.length})
              </CardTitle>
              <CardDescription>
                All registered students with their timetable data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {students.map(student => (
                    <Card key={student.id} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{student.name}</h3>
                        <div className="grid grid-cols-2 gap-x-2 text-sm mt-1">
                          <span className="text-muted-foreground">Reg No:</span>
                          <span>{student.regNo}</span>
                          <span className="text-muted-foreground">Roll No:</span>
                          <span>{student.rollNo}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(student.createdAt || "").toLocaleString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                  <p>Loading student data...</p>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No students registered yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

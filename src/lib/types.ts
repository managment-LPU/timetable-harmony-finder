
export type TimeSlot = {
  hour: number;
  isSelected: boolean;
};

export type DaySchedule = {
  day: string;
  slots: TimeSlot[];
};

export type Student = {
  id?: string;
  name: string;
  regNo: string;
  rollNo: string;
  schedule: DaySchedule[];
  createdAt?: string;
};

export type CommonSlot = {
  day: string;
  hour: number;
  students: string[];
};

export type AnalysisResult = {
  commonSlots: CommonSlot[];
  aiSummary: string;
  lastUpdated: string;
};

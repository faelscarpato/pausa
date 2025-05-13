
import React, { createContext, useContext, useState, useEffect } from "react";
import { AttendanceStatus, DailyAttendance, BreakSchedule } from "@/types/attendance";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/data";

interface AttendanceContextProps {
  attendanceRecords: DailyAttendance[];
  breakSchedules: BreakSchedule[];
  addAttendanceRecord: (record: DailyAttendance) => void;
  getAttendanceStatus: (operatorId: string, date: string) => AttendanceStatus;
  getAttendanceForDate: (date: string) => DailyAttendance[];
  getAbsenceCountForMonth: (operatorId: string, year: number, month: number) => number;
  getBreakSchedule: (date: string) => BreakSchedule[];
  generateBreakSchedules: (date: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AttendanceContext = createContext<AttendanceContextProps | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendance[]>([]);
  const [breakSchedules, setBreakSchedules] = useState<BreakSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Load data from localStorage on startup
  useEffect(() => {
    const savedAttendance = localStorage.getItem("attendanceRecords");
    const savedBreakSchedules = localStorage.getItem("breakSchedules");
    
    if (savedAttendance) {
      setAttendanceRecords(JSON.parse(savedAttendance));
    }
    
    if (savedBreakSchedules) {
      setBreakSchedules(JSON.parse(savedBreakSchedules));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("breakSchedules", JSON.stringify(breakSchedules));
  }, [breakSchedules]);

  const addAttendanceRecord = (record: DailyAttendance) => {
    setAttendanceRecords(prev => {
      // Remove any existing record for the same operator/date
      const filtered = prev.filter(
        r => !(r.operatorId === record.operatorId && r.date === record.date)
      );
      
      // Add the new record
      const newRecords = [...filtered, record];
      
      // Generate break schedules if this is a new date
      const dateExists = prev.some(r => r.date === record.date);
      if (!dateExists) {
        setTimeout(() => generateBreakSchedules(record.date), 0);
      }
      
      toast({
        title: "Registro atualizado",
        description: `Status atualizado para ${record.status === 'present' ? 'Presente' : 'Ausente'}`,
      });
      
      return newRecords;
    });
  };

  const getAttendanceStatus = (operatorId: string, date: string): AttendanceStatus => {
    const record = attendanceRecords.find(
      r => r.operatorId === operatorId && r.date === date
    );
    return record ? record.status : "unregistered";
  };

  const getAttendanceForDate = (date: string): DailyAttendance[] => {
    return attendanceRecords.filter(record => record.date === date);
  };

  const getAbsenceCountForMonth = (operatorId: string, year: number, month: number): number => {
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.operatorId === operatorId && 
             recordDate.getFullYear() === year && 
             recordDate.getMonth() === month - 1 && 
             record.status === "absent";
    }).length;
  };

  const getBreakSchedule = (date: string): BreakSchedule[] => {
    return breakSchedules.filter(schedule => schedule.date === date);
  };

  const generateBreakSchedules = (date: string) => {
    import("@/lib/data").then(({ breakAssignments }) => {
      const absences = attendanceRecords
        .filter(r => r.date === date && r.status === "absent")
        .map(r => r.operatorId);
      
      let newSchedules: BreakSchedule[] = [];
      
      // Generate schedules for each supervisor group, accounting for absences
      breakAssignments.forEach(assignment => {
        const { supervisorId, operatorIds } = assignment;
        
        // Filter out absent operators
        const presentOperatorIds = operatorIds.filter(id => !absences.includes(id));
        
        // Assign hours to present operators (15h to 19h)
        presentOperatorIds.forEach((opId, index) => {
          newSchedules.push({
            supervisorId,
            operatorId: opId,
            hour: 15 + index,
            date,
          });
        });
        
        // Add the supervisor at the end (20h)
        newSchedules.push({
          supervisorId,
          operatorId: supervisorId,
          hour: 20,
          date,
        });
      });
      
      // Remove any existing schedules for this date
      setBreakSchedules(prev => {
        const filtered = prev.filter(s => s.date !== date);
        return [...filtered, ...newSchedules];
      });
      
      toast({
        title: "Horários de pausa atualizados",
        description: `Os horários foram ajustados considerando as presenças e ausências de ${date}`,
      });
    });
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        breakSchedules,
        addAttendanceRecord,
        getAttendanceStatus,
        getAttendanceForDate,
        getAbsenceCountForMonth,
        getBreakSchedule,
        generateBreakSchedules,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect } from "react";
import { AttendanceStatus, DailyAttendance, BreakSchedule } from "@/types/attendance";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceContextProps {
  attendanceRecords: DailyAttendance[];
  breakSchedules: BreakSchedule[];
  addAttendanceRecord: (record: DailyAttendance) => void;
  getAttendanceStatus: (operatorId: string, date: string) => AttendanceStatus;
  getAttendanceForDate: (date: string) => DailyAttendance[];
  getAbsenceCountForMonth: (operatorId: string, year: number, month: number) => number;
  getBreakSchedule: (date: string) => BreakSchedule[];
  generateBreakSchedules: (date: string) => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const AttendanceContext = createContext<AttendanceContextProps | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendance[]>([]);
  const [breakSchedules, setBreakSchedules] = useState<BreakSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load data from Supabase on startup
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        console.log("Fetching attendance records...");
        const { data, error } = await supabase
          .from('absences_new')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          console.log("Fetched attendance records:", data.length);
          const mappedRecords: DailyAttendance[] = data.map(record => ({
            date: record.date,
            operatorId: record.employee_id.toString(),
            status: record.status === "absent" ? "absent" : "present"
          }));
          
          setAttendanceRecords(mappedRecords);
        }
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      }
    };
    
    const fetchBreakSchedules = async () => {
      try {
        console.log("Fetching break schedules...");
        const { data, error } = await supabase
          .from('break_schedules_new')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          console.log("Fetched break schedules:", data.length);
          const mappedSchedules: BreakSchedule[] = data.map(schedule => ({
            date: schedule.date,
            supervisorId: schedule.supervisor_id.toString(),
            operatorId: schedule.operator_id ? schedule.operator_id.toString() : "",
            hour: schedule.hour
          }));
          
          setBreakSchedules(mappedSchedules);
        }
      } catch (error) {
        console.error("Error fetching break schedules:", error);
      }
    };
    
    fetchAttendanceRecords();
    fetchBreakSchedules();
  }, []);

  const addAttendanceRecord = async (record: DailyAttendance) => {
    setAttendanceRecords(prev => {
      // Remove any existing record for the same operator/date
      const filtered = prev.filter(
        r => !(r.operatorId === record.operatorId && r.date === record.date)
      );
      
      // Add the new record
      return [...filtered, record];
    });
    
    toast({
      title: "Registro atualizado",
      description: `Status atualizado para ${record.status === 'present' ? 'Presente' : 'Ausente'}`,
    });
    
    // Generate break schedules if this is a new date
    const dateExists = attendanceRecords.some(r => r.date === record.date);
    if (!dateExists) {
      await generateBreakSchedules(record.date);
    }
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

  const generateBreakSchedules = async (date: string): Promise<void> => {
    try {
      console.log("Generating break schedules for date:", date);
      // Get all absences for the specified date
      const absences = attendanceRecords
        .filter(r => r.date === date && r.status === "absent")
        .map(r => r.operatorId);
      
      console.log("Found absences:", absences);
      
      // Get all supervisor assignments
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('break_assignments_new')
        .select('supervisor_id, operator_id');
      
      if (assignmentError) throw assignmentError;
      console.log("Assignment data:", assignmentData);
      
      // Get all break rotations for the current month/year
      const currentDate = new Date(date);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const { data: rotationData, error: rotationError } = await supabase
        .from('break_rotations_new')
        .select('operator_id, hour')
        .eq('month', month)
        .eq('year', year);
      
      if (rotationError) throw rotationError;
      console.log("Rotation data:", rotationData);
      
      // Group operators by supervisor
      const supervisorGroups: Record<string, string[]> = {};
      
      assignmentData.forEach(assignment => {
        const supervisorId = assignment.supervisor_id.toString();
        const operatorId = assignment.operator_id.toString();
        
        if (!supervisorGroups[supervisorId]) {
          supervisorGroups[supervisorId] = [];
        }
        
        supervisorGroups[supervisorId].push(operatorId);
      });
      
      console.log("Supervisor groups:", supervisorGroups);
      
      let newSchedules: BreakSchedule[] = [];
      
      // Generate schedules for each supervisor group
      Object.entries(supervisorGroups).forEach(([supervisorId, operatorIds]) => {
        // Filter out absent operators
        const presentOperatorIds = operatorIds.filter(id => !absences.includes(id));
        
        // Map operators to their break hours from the rotation data
        const operatorBreakHours: Record<string, number> = {};
        
        rotationData.forEach(rotation => {
          operatorBreakHours[rotation.operator_id.toString()] = rotation.hour;
        });
        
        // Sort operators by their break hour
        presentOperatorIds.sort((a, b) => {
          const hourA = operatorBreakHours[a] || 15;
          const hourB = operatorBreakHours[b] || 15;
          return hourA - hourB;
        });
        
        // Create break schedules for present operators
        presentOperatorIds.forEach(opId => {
          const breakHour = operatorBreakHours[opId] || 15;
          
          newSchedules.push({
            supervisorId,
            operatorId: opId,
            hour: breakHour,
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
      
      console.log("New schedules generated:", newSchedules.length);
      
      // Save the generated schedules to Supabase
      const formattedSchedules = newSchedules.map(schedule => ({
        supervisor_id: parseInt(schedule.supervisorId),
        operator_id: parseInt(schedule.operatorId),
        hour: schedule.hour,
        date: schedule.date
      }));
      
      // Remove existing schedules for this date
      await supabase
        .from('break_schedules_new')
        .delete()
        .eq('date', date);
      
      if (formattedSchedules.length > 0) {
        // Insert new schedules
        const { error: insertError } = await supabase
          .from('break_schedules_new')
          .insert(formattedSchedules);
        
        if (insertError) throw insertError;
      }
      
      // Update local state
      setBreakSchedules(prev => {
        const filtered = prev.filter(s => s.date !== date);
        return [...filtered, ...newSchedules];
      });
      
      toast({
        title: "Horários de pausa atualizados",
        description: `Os horários foram ajustados considerando as presenças e ausências de ${date}`,
      });
    } catch (error) {
      console.error("Error generating break schedules:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar os horários de pausa",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle monthly rotation of break times
  const rotateMonthlyBreakTimes = async () => {
    try {
      // Get current month and year
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get next month and year
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }
      
      console.log(`Rotating break times from ${currentMonth}/${currentYear} to ${nextMonth}/${nextYear}`);
      
      // Get all operators with their current break hours
      const { data: currentBreakHours, error: currentError } = await supabase
        .from('break_rotations_new')
        .select('operator_id, hour')
        .eq('month', currentMonth)
        .eq('year', currentYear);
      
      if (currentError) throw currentError;
      
      if (currentBreakHours && currentBreakHours.length > 0) {
        // Prepare rotated break hours for next month
        const nextMonthRotations = currentBreakHours.map(rotation => {
          let nextHour: number;
          
          // Operators with 19h this month will rotate to 15h next month
          // All others move forward by 1 hour
          if (rotation.hour === 19) {
            nextHour = 15;
          } else {
            nextHour = rotation.hour + 1;
          }
          
          return {
            operator_id: rotation.operator_id,
            month: nextMonth,
            year: nextYear,
            hour: nextHour
          };
        });
        
        // Insert rotated hours for next month
        const { error: insertError } = await supabase
          .from('break_rotations_new')
          .upsert(nextMonthRotations, { 
            onConflict: 'operator_id, month, year'
          });
        
        if (insertError) throw insertError;
        
        console.log("Monthly break time rotation completed");
      }
    } catch (error) {
      console.error("Error rotating monthly break times:", error);
    }
  };
  
  // Check if we need to rotate break times for a new month
  useEffect(() => {
    const checkAndRotateBreakTimes = async () => {
      try {
        // Get today's date and first day of the month
        const today = new Date();
        
        // If today is the first day of the month, check if we need to rotate
        if (today.getDate() === 1) {
          // Check if we've already rotated for this month
          const month = today.getMonth() + 1;
          const year = today.getFullYear();
          
          const storedLastRotation = localStorage.getItem('lastBreakRotation');
          const lastRotation = storedLastRotation ? JSON.parse(storedLastRotation) : { month: 0, year: 0 };
          
          // If we haven't rotated for this month yet
          if (lastRotation.month !== month || lastRotation.year !== year) {
            await rotateMonthlyBreakTimes();
            
            // Store that we've rotated for this month
            localStorage.setItem('lastBreakRotation', JSON.stringify({ month, year }));
            
            toast({
              title: "Rotação de horários concluída",
              description: `Os horários de pausa foram rotacionados para o mês ${month}/${year}`,
            });
          }
        }
      } catch (error) {
        console.error("Error checking break time rotation:", error);
      }
    };
    
    // Check when the component mounts
    checkAndRotateBreakTimes();
    
    // Set up a daily check
    const intervalId = setInterval(checkAndRotateBreakTimes, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

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

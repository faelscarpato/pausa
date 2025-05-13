
export type AttendanceStatus = 'present' | 'absent' | 'unregistered';

export type Operator = {
  id: string;
  name: string;
  role: 'operator' | 'supervisor';
  isSupervisor: boolean;
};

export type DailyAttendance = {
  date: string; // Format: YYYY-MM-DD
  operatorId: string;
  status: AttendanceStatus;
};

export type BreakSchedule = {
  supervisorId: string;
  operatorId: string;
  hour: number; // 15, 16, 17, 18, 19, 20
  date: string; // Format: YYYY-MM-DD
};

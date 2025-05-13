
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDaysInMonth, formatDate } from '@/lib/data';
import { useAttendance } from '@/contexts/AttendanceContext';

const MonthlyCalendarView: React.FC = () => {
  const { selectedDate, attendanceRecords } = useAttendance();
  
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Get absence counts for each day
  const dailyAbsenceCounts = days.map(day => {
    const date = new Date(year, month - 1, day);
    const formattedDate = formatDate(date);
    
    const absences = attendanceRecords.filter(
      record => record.date === formattedDate && record.status === 'absent'
    );
    
    return absences.length;
  });
  
  // Get the month name
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthName = monthNames[month - 1];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Calendário de Ausências - {monthName}/{year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 font-medium text-center mb-2">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Add empty cells for days before the 1st of the month */}
          {Array.from({ length: new Date(year, month - 1, 1).getDay() }, (_, i) => (
            <div key={`empty-start-${i}`} className="h-14 md:h-20"></div>
          ))}
          
          {/* Days of the month */}
          {days.map((day, index) => {
            const absenceCount = dailyAbsenceCounts[index];
            const dayDate = new Date(year, month - 1, day);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const isWeekend = [0, 6].includes(dayDate.getDay());
            
            // Determine background color based on absence count
            let bgColor = "bg-white";
            if (isWeekend) bgColor = "bg-gray-100";
            if (absenceCount > 0) bgColor = "bg-red-100";
            if (absenceCount > 3) bgColor = "bg-red-200";
            if (absenceCount > 5) bgColor = "bg-red-300";
            
            return (
              <div 
                key={day} 
                className={`${bgColor} ${isToday ? 'ring-2 ring-blue-500' : ''} 
                            h-14 md:h-20 border rounded-md p-1 flex flex-col`}
              >
                <div className="text-right text-sm">{day}</div>
                {absenceCount > 0 && (
                  <div className="mt-auto text-center font-medium text-red-600">
                    {absenceCount}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Add empty cells for days after the end of the month */}
          {Array.from(
            { length: 6 - new Date(year, month - 1, daysInMonth).getDay() }, 
            (_, i) => i !== 6 && (
              <div key={`empty-end-${i}`} className="h-14 md:h-20"></div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyCalendarView;

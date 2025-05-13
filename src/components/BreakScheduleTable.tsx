
import React from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getOperatorById } from "@/lib/data";
import { Clock } from "lucide-react";

const BreakScheduleTable: React.FC = () => {
  const { selectedDate, breakSchedules, getBreakSchedule, generateBreakSchedules } = useAttendance();
  const formattedDate = formatDate(selectedDate);
  const schedules = getBreakSchedule(formattedDate);
  
  // Group schedules by supervisor
  const scheduleBySupervisor = React.useMemo(() => {
    const grouped = schedules.reduce((acc, schedule) => {
      const { supervisorId } = schedule;
      if (!acc[supervisorId]) {
        acc[supervisorId] = [];
      }
      acc[supervisorId].push(schedule);
      return acc;
    }, {} as Record<string, typeof schedules>);
    
    // Sort by hour within each group
    Object.keys(grouped).forEach(supervisorId => {
      grouped[supervisorId].sort((a, b) => a.hour - b.hour);
    });
    
    return grouped;
  }, [schedules]);
  
  const handleRegenerateSchedules = () => {
    generateBreakSchedules(formattedDate);
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Horários de Pausa</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Não há horários de pausa definidos para esta data.</p>
          <Button onClick={handleRegenerateSchedules}>
            <Clock className="mr-2" />
            Gerar Horários de Pausa
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Horários de Pausa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={handleRegenerateSchedules} variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Atualizar Horários
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-control">
            <thead>
              <tr>
                <th>TROCADOR</th>
                <th>15h</th>
                <th>16h</th>
                <th>17h</th>
                <th>18h</th>
                <th>19h</th>
                <th>20h</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scheduleBySupervisor).map(([supervisorId, schedules]) => {
                const supervisor = getOperatorById(supervisorId);
                if (!supervisor) return null;
                
                return (
                  <tr key={supervisorId}>
                    <td className="font-semibold">{supervisor.name}</td>
                    {[15, 16, 17, 18, 19, 20].map(hour => {
                      const schedule = schedules.find(s => s.hour === hour);
                      if (!schedule) return <td key={hour}>-</td>;
                      
                      const operator = getOperatorById(schedule.operatorId);
                      return (
                        <td key={hour}>
                          {operator?.name || '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakScheduleTable;

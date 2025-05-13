
import React from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { operators, formatDate } from "@/lib/data";
import { Check, X } from "lucide-react";

const AttendanceSummary: React.FC = () => {
  const { selectedDate, getAttendanceStatus } = useAttendance();
  const formattedDate = formatDate(selectedDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Resumo de Presenças do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {operators.map(operator => {
            const status = getAttendanceStatus(operator.id, formattedDate);
            
            let bgColor = "bg-gray-100"; // Unregistered
            if (status === "present") bgColor = "bg-green-100";
            if (status === "absent") bgColor = "bg-red-100";
            
            return (
              <div 
                key={operator.id} 
                className={`${bgColor} p-3 rounded-lg border flex items-center justify-between`}
              >
                <span className="font-medium">{operator.name}</span>
                <StatusIcon status={status} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case "present":
      return <Check className="text-green-600 h-5 w-5" />;
    case "absent":
      return <X className="text-red-600 h-5 w-5" />;
    default:
      return <span className="text-gray-400 text-sm">Não registrado</span>;
  }
};

export default AttendanceSummary;

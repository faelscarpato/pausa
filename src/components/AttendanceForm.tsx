
import React from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { operators, formatDate } from "@/lib/data";
import { AttendanceStatus } from "@/types/attendance";

const AttendanceForm: React.FC = () => {
  const { selectedDate, addAttendanceRecord, getAttendanceStatus } = useAttendance();
  const [selectedOperator, setSelectedOperator] = React.useState<string>("");
  const [selectedStatus, setSelectedStatus] = React.useState<AttendanceStatus>("present");
  const formattedDate = formatDate(selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOperator) return;

    addAttendanceRecord({
      date: formattedDate,
      operatorId: selectedOperator,
      status: selectedStatus,
    });

    // Reset form
    setSelectedOperator("");
    setSelectedStatus("present");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Registrar Presença/Ausência</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="operator" className="block text-sm font-medium">
              Selecione o Funcionário:
            </label>
            <Select 
              value={selectedOperator} 
              onValueChange={setSelectedOperator}
            >
              <SelectTrigger id="operator">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.name}
                    {getAttendanceStatus(op.id, formattedDate) !== "unregistered" && 
                      ` (${getAttendanceStatus(op.id, formattedDate) === "present" ? "Presente" : "Ausente"})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium">
              Status:
            </label>
            <Select 
              value={selectedStatus} 
              onValueChange={(val) => setSelectedStatus(val as AttendanceStatus)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Presente</SelectItem>
                <SelectItem value="absent">Ausente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Registrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;

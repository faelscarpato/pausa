
import React, { useEffect, useState } from "react";
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
import { AttendanceStatus, Operator } from "@/types/attendance";
import { Edit, PlusCircle } from "lucide-react";
import OperatorDialog from "./OperatorDialog";
import { supabase } from "@/integrations/supabase/client";

const AttendanceForm: React.FC = () => {
  const { selectedDate, addAttendanceRecord, getAttendanceStatus } = useAttendance();
  const [selectedOperator, setSelectedOperator] = React.useState<string>("");
  const [selectedStatus, setSelectedStatus] = React.useState<AttendanceStatus>("present");
  const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
  const formattedDate = formatDate(selectedDate);
  
  const fetchOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const mappedOperators: Operator[] = data.map(emp => ({
        id: emp.id.toString(),
        name: emp.name,
        role: emp.role as "operator" | "supervisor",
        isSupervisor: emp.role === "supervisor"
      }));
      
      setOperatorsList(mappedOperators);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };
  
  useEffect(() => {
    fetchOperators();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOperator) return;

    // Adicionar registro de presença diretamente no Supabase
    try {
      const { error } = await supabase
        .from('absences')
        .upsert({
          employee_id: parseInt(selectedOperator),
          date: formattedDate,
          status: selectedStatus === "absent" ? "absent" : "present",
          reason: selectedStatus === "absent" ? "Não informado" : ""
        }, {
          onConflict: 'employee_id,date'
        });
      
      if (error) throw error;
      
      // Atualizar o estado local
      addAttendanceRecord({
        date: formattedDate,
        operatorId: selectedOperator,
        status: selectedStatus,
      });

      // Reset form
      setSelectedOperator("");
      setSelectedStatus("present");
    } catch (error) {
      console.error("Erro ao registrar presença:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Registrar Presença/Ausência</CardTitle>
          <OperatorDialog 
            mode="add"
            onSave={fetchOperators}
            trigger={
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="operator" className="block text-sm font-medium">
              Selecione o Funcionário:
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Select 
                  value={selectedOperator} 
                  onValueChange={setSelectedOperator}
                >
                  <SelectTrigger id="operator">
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorsList.map(op => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.name}
                        {getAttendanceStatus(op.id, formattedDate) !== "unregistered" && 
                          ` (${getAttendanceStatus(op.id, formattedDate) === "present" ? "Presente" : "Ausente"})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedOperator && (
                <OperatorDialog 
                  mode="edit"
                  operator={operatorsList.find(op => op.id === selectedOperator)}
                  onSave={fetchOperators}
                  trigger={
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
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

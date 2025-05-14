
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
import { formatDate } from "@/lib/data";
import { AttendanceStatus, Operator } from "@/types/attendance";
import { Edit, PlusCircle, RefreshCw } from "lucide-react";
import OperatorDialog from "./OperatorDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AttendanceForm: React.FC = () => {
  const { selectedDate, addAttendanceRecord, getAttendanceStatus, generateBreakSchedules } = useAttendance();
  const [selectedOperator, setSelectedOperator] = React.useState<string>("");
  const [selectedStatus, setSelectedStatus] = React.useState<AttendanceStatus>("present");
  const [operatorsList, setOperatorsList] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formattedDate = formatDate(selectedDate);
  
  const fetchOperators = async () => {
    setLoading(true);
    try {
      console.log("Fetching operators...");
      const { data, error } = await supabase
        .from('employees_new')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      console.log("Fetched operators:", data?.length);
      const mappedOperators: Operator[] = data.map(emp => ({
        id: emp.id.toString(),
        name: emp.name,
        role: emp.role as "operator" | "supervisor",
        isSupervisor: emp.role === "supervisor"
      }));
      
      setOperatorsList(mappedOperators);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar lista de funcionários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOperators();
  }, []);
  
  // Reset selected operator when changing date
  useEffect(() => {
    setSelectedOperator("");
    setSelectedStatus("present");
  }, [selectedDate]);

  // Update selected status if operator is already registered
  useEffect(() => {
    if (selectedOperator) {
      const status = getAttendanceStatus(selectedOperator, formattedDate);
      if (status !== "unregistered") {
        setSelectedStatus(status);
      } else {
        setSelectedStatus("present");
      }
    }
  }, [selectedOperator, formattedDate, getAttendanceStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOperator) {
      toast({
        title: "Erro",
        description: "Selecione um funcionário",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);

    try {
      console.log("Registering attendance:", {
        employee_id: parseInt(selectedOperator),
        date: formattedDate,
        status: selectedStatus
      });
      
      // Add attendance record directly to Supabase
      const { error } = await supabase
        .from('absences_new')
        .upsert({
          employee_id: parseInt(selectedOperator),
          date: formattedDate,
          status: selectedStatus === "absent" ? "absent" : "present",
          reason: selectedStatus === "absent" ? "Não informado" : ""
        }, {
          onConflict: 'employee_id,date'
        });
      
      if (error) throw error;
      
      // Update the local state
      addAttendanceRecord({
        date: formattedDate,
        operatorId: selectedOperator,
        status: selectedStatus,
      });
      
      // Regenerate break schedules to account for the new attendance status
      await generateBreakSchedules(formattedDate);

      // Reset form
      setSelectedOperator("");
      setSelectedStatus("present");
      
      toast({
        title: "Sucesso",
        description: `Presença registrada com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao registrar presença:", error);
      toast({
        title: "Erro",
        description: "Falha ao registrar presença",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p>Carregando funcionários...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="operator" className="block text-sm font-medium">
                Selecione o Funcionário:
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Select 
                    value={selectedOperator} 
                    onValueChange={(value) => {
                      setSelectedOperator(value);
                      
                      // Update status based on current registration
                      const currentStatus = getAttendanceStatus(value, formattedDate);
                      if (currentStatus !== "unregistered") {
                        setSelectedStatus(currentStatus);
                      }
                    }}
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
              {selectedStatus === "absent" && (
                <p className="text-xs text-amber-600 mt-1">
                  Funcionários ausentes serão removidos da escala de pausas deste dia.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Registrando..." : "Registrar"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
